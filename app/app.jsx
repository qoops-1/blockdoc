import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3';

import {SHA256} from 'crypto-js';
import Documents from '../build/contracts/Documents.sol.js'

let web3
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
Documents.setProvider(web3.currentProvider)
let acc = web3.eth.accounts[0]
let docs = Documents.deployed()


class Form extends React.Component {
    constructor(props) {
        super(props)
        this.state = {value: ""}
        this.handleUpload = this.handleUpload.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(e) {
        this.props.onSubmit(e)
    }

    handleUpload(e) {
        this.setState({ value: e.target.value })
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="file" id="doc-field" value={this.state.value} onChange={this.handleUpload}/>
                <input type="submit" value="Submit"/>
            </form>
        )
    }
}

function Status(props) {
    if (props.existed === null) {
        return null
    }
    if (props.existed) {
        text = "The document has already existed"
    } else {
        text = "The document was successfully saved"
    }
    return (
        <span>
            {text}
            <br/>
            Timestamp: {props.timestamp}
            <br/>
            Document hash: {props.hash}
        </span>
    )
}

class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hash: null,
            timestamp: null,
            existed: null
        }
        this.onSubmit = this.onSubmit.bind(this)
    }

    onSubmit(e) {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = (e => {
                const hash = SHA256(e.target.result)
                docs.documents.call(hash, {from: acc}).then(timestamp => {
                    console.log("checked timestamp: " + timestamp)
                    let newState = { hash: hash }
                    if (timestamp == 0) {
                        const timeOfAddition = docs.addDocument(hash, {from: acc}).then(() => docs.documents.call(hash, {from: acc}))
                        timeOfAddition.then(((time) => {
                            console.log("Timestamp for the new doc: " + time)
                            this.setState(newState)
                        }).bind(this))
                    } else {
                        console.log("The doc was already there with timestamp: " + timestamp)
                        newState.timestamp = timestamp
                        newState.existed = true                        
                        this.setState(newState)
                    }
                })
        }).bind(this)
        reader.onerror = e => { console.error("Error loading file") }
        reader.readAsText(document.getElementById("doc-field").files[0])
    }

    render() {
        return (
            <div>
                <Form
                    onSubmit={this.onSubmit} />
                <Status hash={this.state.hash} timestamp={this.state.timestamp} existed={this.state.existed} />
            </div>
        )
    }
}
ReactDOM.render(<Container/>, document.getElementById('root'));