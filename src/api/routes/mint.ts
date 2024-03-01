import sdk from "@/thirdweb";
import { Router } from "express";


export const mintRouter = Router();

mintRouter.get("/", async (req, res) => {
    const contract = await sdk.getContract("0x317197Bcbf59603cd999fFC9e090279b35b60249")
    const tx = await contract.erc721.mint({
        name: "Hev Abi #3 - Imageless",
    })

    res.status(200).json(tx)
})

mintRouter.get("/claim", async (req, res) => {
    const contract = await sdk.getContract("0x317197Bcbf59603cd999fFC9e090279b35b60249")
    const tx = await contract.erc721.claim.prepare(1)
    
    // some example use case for the transaction
    // Front-end can use this to show the gas cost to the user
    const gasCost = await tx.estimateGasCost()
    const simulatedTx = await tx.simulate() // Simulate the transaction
    const signedTx = await tx.sign() // Sign the transaction for later use
})