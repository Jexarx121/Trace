import { useState } from 'react';

type FAQComponents = {
  question: string;
  answer: string;
}

const questionAnswers: FAQComponents[] = [
  {
    question: 'What is Trace?',
    answer: 'Trace is a web app built on the blockchain for the purpose of your tracking volunteering work in a tamper-proof manner.\n \
    \nTrace aims to work in tandem with volunteers, company or singular and reward them for their efforts in the form of credits that they can later redeem on the web app.',
  },
  {
    question: 'What is Blockchain?',
    answer: 'Blockchain is a decentralized and distributed ledger technology that securely records and verifies transactions across a network of computers.\n \
    \nIt consists of a chain of blocks, each containing a list of transactions, and is maintained by a network of nodes (computers) that reach consensus on the validity of these transactions. \
The tamper-proof nature of blockchain is achieved through cryptographic hashing and consensus mechanisms. Each block contains a hash of the previous block, creating a chain. \
    \n\nOnce a block is added, altering any previous block would require changing the information in all subsequent blocks, making tampering practically impossible.',
  },
  {
    question: 'What are the credits for?',
    answer: 'Credits are redeemable by users to ask other volunteers to do work similar to the work they have done in the past. This in turn perpetuates a generational contract between the people in need and the volunteer where aid is always available to those who need it and those who can grant it.',
  },
  {
    question: 'Why should I track volunteering work?',
    answer: 'Due to the rise in the elderly population, in turn there has also been a rise in volunteer work too. Therefore it is important \
    to track volunteering efforts to capture the impact of the volunteer work and to redeem credits. \n\nAs well as that, Trace provides a verifiable\
way to show that volunteering work has been done and show exactly the amount of hours doing so. This can be useful to people who need to provide volunteering hours as for graduation, CV etc.',
  },
  {
    question: 'Why was Trace made?',
    answer: 'Besides providing a tamper-proof way to record volunteering work, Trace was created initially to support the rising population of volunteers and people in need.\
 This web app aims to create a generational contract between these two parties and the credit system is the currency used within this contract to self-perpetuate.',
  },
  {
    question: 'How can I use Trace?',
    answer: 'Simply make an account with us (or login if you have an account already) and you can use all the features immediately on your desktop and mobile phone. \
    \n\nYou can track your credits at your account page as well as provide a description of yourself and your previous experience. Don\'t worry if you dont have any, this is a great place to start.\
    \n\nOn the Dashboard page, you can see the posts that other users have created and are asking for help. You can also create posts for the cost of credit as well as assign yourself to posts to receive credit. \
    \n\nNew users automatically gain 100 free credits to use immediately should they require it.\
    \n\nAll these features are completely free and readily available at all times.',
  },
  {
    question: 'What are these credits and how are they rewarded?',
    answer: 'Simply put, these credits are simply tokens rewarded to users for their work and can be used to create posts for yourself seeking assistance. \
    \n\nIn more detail, these credits are a ERC20 token created by a smart contract solely for the transactional purpose of this website. They have no financial merit outside of this website.\
    \n\nThese credits are rewarded after a creator of the post completes the work assigned to you. This work is then tracked on the website and the smart contract initiates a transaction to you.\
    \n\nFor those who are more involved with the blockchain, all users have a custodial wallet created for them for these transactions to go through. The aim is that users reap the benefits of DLT without having to worry about the cumbersome entry.',
  },
  {
    question: 'What work is stored on the blockchain?',
    answer: 'After a user completes a post, only a certain fragment of the post is stored on the chain. \
    \n\nWe have a smart contract built that stores details such as the amount of credit received, the amount of time (in hours) and the people involved. \
    \n\nYou can view such details on the Dashboard by filtering completed posts.',
  },
  {
    question: 'Can I gain credits without doing any volunteering work?',
    answer: 'To accommodate for users who are not able to work or simply discovered Trace late, Trace provides a way to gain some credits after donating some money to a charity of their choice. \
    \n\nThe reason behind the charity donation decision is to keep the volunteering spirit true for all components of this application - Do good for good.'
  },
  {
    question: 'Are the transactions on the blockchain on mainnet?',
    answer: 'No, this is solely for demonstration and all transactions are stored on the sepolia testnet.'
  }
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="bg-[#FFFFFF]">
      <div className="w-full md:w-[70vw] mx-auto flex flex-col lg:flex-row mt-20 mb-20">
        <div className="w-full sm:p-5 md:p-0 px-4">
          <h1 className="font-bold mb-4 mt-4 uppercase text-[#1f2421]">Frequently Asked Questions</h1>
          <div className='text-2xl'>
            {questionAnswers.map((faq, index) => (
              <div key={index} className="mb-4 border-gray-500 border-b-2 border-opacity-50">
                <div
                  className="cursor-pointer flex justify-between items-center py-2 bg-#1f2421 text-[#49A078] "
                  onClick={() => toggleAnswer(index)}
                >
                  <div>{faq.question}</div>
                  <div className='items-end'>{activeIndex === index ? '˄' : '⌄'}</div>
                </div>
                {activeIndex === index && (
                  <div className="p-4 bg-#333c3a text-[#1f2421]">
                    <p style={{ whiteSpace: "pre-wrap"}}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;