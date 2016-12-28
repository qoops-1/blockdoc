import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3';

import {SHA256} from 'crypto-js';
import Documents from '../build/contracts/Documents.sol.js'

let web3
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
Documents.setProvider(web3.currentProvider)
window.Documents = Documents.deployed()

class Form extends React.Component {
    constructor(props) {
        super(props)
        this.state = {value: "", hash: ""}
        this.handleUpload = this.handleUpload.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(e) {
        e.preventDefault()
        let reader = new FileReader()
        reader.onload = ((that) => { 
            return e => {
                let hash = SHA256(e.target.result)
                let tstamp = Documents.documents.call(hash)
                if (tstamp) {
                    console.log(tstamp)
                }
                that.setState({ hash: SHA256(e.target.result) })
            }
        })(this)
        reader.onerror = e => { console.log("Error loading file") }
        reader.readAsText(document.getElementById("doc-field").files[0])
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
        return ""
    }
}

ReactDOM.render(<Form/>, document.getElementById('root'));