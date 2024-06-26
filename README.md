# Trace
Website for volunteers to record their efforts and receive redeemable credits as a reward. They can redeeem this credits in future to request for assistance of their own. 

People that require assistance expend credits and wait for a volunteer to accept their request.

The credits and requests are stored on the blockchain through smart contracts. The credits are an ERC20 smart contract.

This was a final year project and a first real experience into React, Typescript, Solidity and Blockchain. Tailwind CSS for used for design. To run this, you need env variables for both folders.

If the website stops working at any point, it most likely is either the Supabase database is down or the ethereum wallet is out of funds.

[Deployed Site](https://trace-sand.vercel.app/)

## To do list
- [x] Authentication
- [x] Account
- [x] Users can create posts
- [x] Users can update and delete posts
- [x] Users can assign themselves to posts
- [x] Creators can approve volunteers to posts
- [x] Create a smart contract for credits and posts
- [x] Automatically creates user's wallets after registration with ethers
- [x] ERC20 Smart contract for tokens
- [x] Smart contract for post details after being finished
- [x] Users can finish posts
- [x] Users can visit other accounts through react router dom.
- [x] Users can now see their own credits.
- [x] Posts can filtered on dashboard

## Things that should be added but no time
- [ ] Free funds for a user should be linked to charity donation
- [ ] Meta transactions
- [ ] Gas optimizations
- [ ] Metamask and other wallet integrations
- [ ] Security audit
- [ ] Proper Credit system with volunteers.
- [ ] Improvment of loading times using server side rendering.
- [ ] Lots of try catch blocks to be properly implemented.
