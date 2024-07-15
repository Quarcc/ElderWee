const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(blockNo, timestamp, data, previousHash = " "){
        this.blockNo = blockNo;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.Hash();
        this.nonce = 0;
    }

    Hash(){
        return SHA256(
            this.blockNo + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce
        ).toString();
    }

    proofOfWork(difficulty){
        while(
            this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
        ) {
            this.nonce++;
            this.hash = this.Hash();
        }
    }
}

class Blockchain{
    constructor() {
        this.blockchain = [this.startGenesisBlock()];
        this.difficulty = 2;
    }

    startGenesisBlock(){
        const currentDate = new Date()
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        return new Block('0000000000000000', formattedDate, "Genesis Block", "0");
    }

    obtainLatestBlock(){
        return this.blockchain[this.blockchain.length - 1];
    }

    addNewBlock(newBlock){
        newBlock.previousHash = this.obtainLatestBlock().hash;
        newBlock.hash = newBlock.Hash();
        newBlock.proofOfWork(this.difficulty);
        this.blockchain.push(newBlock);
    }

    checkChainValidity() {
        for (let i = 1; i < this.blockchain.length; i++) {
            const currentBlock = this.blockchain[i];
            const previousBlock = this.blockchain[i - 1];

            if (currentBlock.hash !== currentBlock.Hash()){
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash){
                return false;
            }

            return true;
        }
    }
};

module.exports = {Block, Blockchain}