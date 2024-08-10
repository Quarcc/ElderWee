const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPEN_AI_API_KEY
});

const model = "gpt-3.5-turbo";
const systemPrompt = `
  You are an automatic filtering system. You will be given a JSON list of email addresses such as the following:
  [
    {
        "Email": "amy.davis@elderwee.com"
    },
    {
        "Email": "anthony.harris@yahoo.com"
    },
    {
        "Email": "anthony.bruce@gmail.com"
    },
    {
        "Email": "barbara.robinson@gmail.com"
    },
    {
        "Email": "brandonwee@gmail.com"
    },
  ]
  Take note of all the "Email" values such as "amy.davis@elderwee.com" and "anthony.harris@yahoo.com" as an example.
  You will be provided with a string to help identify what email addresses are to be filtered to.

  The following are examples of how you should work.
  
  Example 1:
  My provided prompt: Target: "amy", Data: "[
    {
        "Email": "amy.davis@elderwee.com"
    },
    {
        "Email": "anthony.harris@yahoo.com"
    },
    {
        "Email": "anthony.bruce@gmail.com"
    },
    {
        "Email": "barbara.robinson@gmail.com"
    },
    {
        "Email": "brandonwee@gmail.com"
    },
  ]"
  The email filtered from the provided data earlier should only obtain "amy.davis@elderwee.com" as that is the only email address with "amy" in it. If there are more email addresses that matches the prompt, do include them. However for this case, only "amy.davis@elderwee.com" should be returned.

  Exmaple 2:
  My provided prompt: Target: "anthony", Data: "[
    {
        "Email": "amy.davis@elderwee.com"
    },
    {
        "Email": "anthony.harris@yahoo.com"
    },
    {
        "Email": "anthony.bruce@gmail.com"
    },
    {
        "Email": "barbara.robinson@gmail.com"
    },
    {
        "Email": "brandonwee@gmail.com"
    },
  ]"
  The email filtered from the provided data earlier should obtain "anthony.harris@yahoo.com" and "anthony.bruce@gmail.com" as those are the only email addresses with "anthony" in it. If there are more email addresses that matches the prompt, do include them. However for this case, only "anthony.harris@yahoo.com" and "anthony.bruce@gmail.com" should be returned.

  Example 3:
  My provided prompt: Target: "gmail.com", , Data: "[
    {
        "Email": "amy.davis@elderwee.com"
    },
    {
        "Email": "anthony.harris@yahoo.com"
    },
    {
        "Email": "anthony.bruce@gmail.com"
    },
    {
        "Email": "barbara.robinson@gmail.com"
    },
    {
        "Email": "brandonwee@gmail.com"
    },
  ]"
  The email filtered from the provided data earlier should obtain "anthony.bruce@gmail.com", "barbara.robinson@gmail.com", and "brandonwee@gmail.com" as these are the email addresses with "gmail.com" in it. If there are more email addresses that matches the prompt, do include them. However for this case, only "anthony.bruce@gmail.com", "barbara.robinson@gmail.com", and "brandonwee@gmail.com" should be returned.

  Now with all the provided examples, it is VERY IMPORTANT to note how the data should be returned. Let's utilise Example 3.
  Your response should include and ONLY include the email addresses that match the provided prompt.
  Your response should be a list of JSON objects similar to the above ones. Do not add any extra text - the only thing you should output is a list of JSON objects. Ensure that the output is JSON-parseable - this is very important. DO NOT SPECIFY IN YOUR RESPONSE THAT THE OUTPUT IS OF JSON FORMAT.

  Your response (using results from Example 3):
  [
    {
      "Email": "anthony.bruce@gmail.com"
    },
    {
      "Email": "barbara.robinson@gmail.com"
    },
    {
      "Email": "brandonwee@gmail.com"
    }
  ]
  
  IT IS IMPORTANT TO FOLLOW THE RESPONSE FORMAT THAT I HAVE PROVIDED AND ONLY THAT RESPONSE.
  `
async function filterEmails(emails, target) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `
          My provided prompt: Target: "${target}", Data: "${emails}"
          `
        }
      ],
      model: model,
    });

    let response = completion.choices[0].message.content;
    return JSON.parse(response)
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { filterEmails }