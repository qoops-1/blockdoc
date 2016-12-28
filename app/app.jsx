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
window.Documents = Documents.deployed()

class Form extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.handleUpload = this.handleUpload.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(e) {
        this.props.onSubmit(e)
    }

    handleUpload(e) {
        this.setState({ value: e.target.value })
        console.log("File uploaded")
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
        if (this.props.existed) {
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
        // TODO: Try binding anonymous function instead of creating closure
        reader.onload = ((that) => { 
            return e => {
                let hash = SHA256(e.target.result)
                let timestamp = Documents.documents.call(hash)
                let docExisted
                if (!timestamp) {
                    docExisted = false
                    Documents.addDocument(hash)
                    timestamp = Documents.documents.call(hash)
                } else {
                    docExisted = true
                }
                // TODO: set state
                that.setState({
                    existed: docExisted,
                    timestamp: timestamp,
                    hash: hash
                })
            }
        })(this)
        reader.onerror = e => { console.log("Error loading file") }
        reader.readAsText(document.getElementById("doc-field").files[0])
    }

    render() {
        return (
            <div>
                <Form
                    onSubmit={onSubmit} />
                <Status
                    hash={this.state.hash}
                    timestamp={this.state.timestamp} />
            </div>
        )
    }
}
ReactDOM.render(<Form/>, document.getElementById('root'));