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
    let text
    if (props.existed) {
        text = "The document has already existed"
    } else {
        text = "The document was successfully saved"
    }
    return (
        <div>
            {text}
            <br/>
            <span>
                Timestamp: {props.timestamp}
            </span>
            <br/>
            <span>
                Document hash: {props.hash}
            </span>
        </div>
    )
}

class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hash: null,
            timestamp: null,
            // True if the document has been saved before
            existed: null
        }
        this.onSubmit = this.onSubmit.bind(this)
    }

    onSubmit(e) {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = (e => {
                const hash = SHA256(e.target.result)
                this.checkDocument(hash)
        }).bind(this)
        reader.onerror = e => { console.error("Error loading file") }
        reader.readAsText(document.getElementById("doc-field").files[0])
    }

    // Checks whether the documents exists and updates state accordingly
    checkDocument(hash) {
        docs.documents.call(hash, {from: acc}).then(timestamp => {
            console.log("checked timestamp: " + timestamp)
            let newState = {
                hash: hash,
                existed: timestamp != 0
            }
            if (!newState.existed) {
                const timeOfAddition = docs.addDocument(hash, {from: acc}).then(() => docs.documents.call(hash, {from: acc}))
                timeOfAddition.then((time) => {
                    console.log("Timestamp for the new doc: " + time)
                    newState.timestamp = time
                    this.setState(newState)
                })
            } else {
                console.log("The doc was already there with timestamp: " + timestamp)
                newState.timestamp = timestamp
                this.setState(newState)
            }
        })
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