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

class Status extends React.Component {

    render() {
        let text = "The document was successfully saved"
        if (this.props.existed === undefined) {
            text = ""
        } else if (this.props.existed) {
            text = "The document has already existed"
        }
        return (
            <span>
                {text}
                <br/>
                Timestamp: {this.props.timestamp}
                <br/>
                Document hash: {this.props.hash}
            </span>
        )
    }
}

class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.onSubmit = this.onSubmit.bind(this)
    }

    onSubmit(e) {
        e.preventDefault()
        let reader = new FileReader()
        reader.onload = (e => {
                let docs = Documents.deployed()
                let hash = SHA256(e.target.result)
                console.log(hash.toString())
                docs.documents.call(hash, {from: acc}).then(timestamp => {
                    let docExisted
                    console.log("checked timestamp: " + timestamp)
                    if (timestamp == 0) {
                        docExisted = false

                        let timeOfAddition = docs.addDocument(hash, {from: acc}).then(() => docs.documents.call(hash, {from: acc}))
                        timeOfAddition.then(((time) => {
                            console.log("Counter time for a new doc: " + time)
                            this.setState({timestamp: time})
                        }).bind(this))
                    } else {
                        docExisted = true
                        console.log("The doc was already there with timestamp: " + timestamp)
                        this.setState({
                            timestamp: timestamp,
                        })
                    }
                    this.setState({
                        hash: hash,
                        existed: docExisted
                    })
                })
        }).bind(this)
        reader.onerror = e => { console.log("Error loading file") }
        reader.readAsText(document.getElementById("doc-field").files[0])
    }

    render() {
        return (
            <div>
                <Form
                    onSubmit={this.onSubmit} />
                <Status
                    existed={this.state.existed}
                    hash={this.state.hash}
                    timestamp={this.state.timestamp} />
            </div>
        )
    }
}
ReactDOM.render(<Container/>, document.getElementById('root'));