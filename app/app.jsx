import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3';
import {SHA256} from 'crypto-js';
import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc.js';

// let engine = new ProviderEngine();
// let web3 = new Web3(engine);
// let base = 'http://localhost:8545'
// engine.addProvider(new RpcSubprovider({
//   rpcUrl: base
// }))

// // network connectivity error
// engine.on('error', function (err) {
//   // report connectivity errors
//   console.error(err)
// })
// // start polling for blocks
// engine.start();
// Documents.setProvider(web3.currentProvider);
// window.web3 = web3;
// web3.Documents = Documents.deployed();

class Form extends React.Component {
    constructor(props) {
        super(props)
        this.state = {value: "", file: ""}
        this.handleUpload = this.handleUpload.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(e) {
        e.preventDefault()
        console.log("on submit: " + SHA256(this.state.file))
    }

    handleUpload(e) {
        this.setState({ value: e.target.value })
        console.log("File uploaded")
        let reader = new FileReader()
        let f
        reader.onload = ((that) => { 
            return e => { 
                console.log("now: " + that.state.file)
                that.setState( { file: e.target.result })
                console.log("then: " + that.state.file)
            }
        })(this)
        reader.onerror = e => { console.log("Error loading file") }
        reader.readAsText(e.target.files[0])
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