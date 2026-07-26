// src/data.js

export const examQuestions = [
  {
    id: 1,
    prompt: "For each of the four statements about the presence of bias within information sources, evaluate whether it is True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Statements from official, verified accounts on social media are trustworthy and without bias.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's2',
        text: "The tone of an information source is important as it can lead to an outsized sense of imminence or impact.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's3',
        text: "The policies and views of publishers and media owners should be reported in a transparent and ethical way.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's4',
        text: "An eyewitness account of a news event is more likely to be credible than a source who must rely on others to provide information.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      }
    ]
  },
  {
    id: 2,
    prompt: "After meeting with a client, the client told your teacher that your team needs to improve its communication skills. Which two actions should you take to improve your communication skills? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Continue the same approach so your team can improve with practice." },
      { id: 'B', text: "Individually text the client to apologize for your poor communication." },
      { id: 'C', text: "Have another team member take over the communication at the next meeting." },
      { id: 'D', text: "Ask your teacher for feedback on which communication skills you need to improve." },
      { id: 'E', text: "When talking with the client, speak in a positive, respectful tone." }
    ],
    correctAnswers: ['D', 'E']
  },
  {
    id: 3,
    prompt: "Your group members need to be informed of a change in plans for the next meeting. Which response is the most efficient choice?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Post the change to your social media account." },
      { id: 'B', text: "Call them each individually." },
      { id: 'C', text: "Send an email to your instructor." },
      { id: 'D', text: "Send an email to the group about the change." }
    ],
    correctAnswers: ['D']
  },
  {
    id: 4,
    prompt: "Match each step in the media creation process with its description:",
    type: "MATCHING TASK",
    sourceItems: [
      { id: 'src1', text: "Scripting, storyboarding, and location scouting" },
      { id: 'src2', text: "Capturing and recording video and audio" },
      { id: 'src3', text: "Editing, applying effects, and adding captions" },
      { id: 'src4', text: "Uploading media to the desired platform" }
    ],
    targetAreas: [
      { id: 'tgt1', label: "Pre-production", correctAnswer: 'src1' },
      { id: 'tgt2', label: "Production", correctAnswer: 'src2' },
      { id: 'tgt3', label: "Post-production", correctAnswer: 'src3' },
      { id: 'tgt4', label: "Distribution", correctAnswer: 'src4' }
    ]
  },
  {
    id: 5,
    prompt: "A classmate is asking for assistance editing a document to help improve readability when posted online. Which two options are the best ways to achieve that? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Encourage them to minimize the use of excessive punctuation and sentences that span multiple lines." },
      { id: 'B', text: "Have them check the text against the grade level it reads at to ensure alignment of message and audience." },
      { id: 'C', text: "Ensure that there is limited contrast between the type and the background to ensure readability on all types of screens." },
      { id: 'D', text: "Remind them to add accessibility features, like closed captions." }
    ],
    correctAnswers: ['A', 'B']
  },
  {
    id: 6,
    prompt: "Your teacher has assigned a group project. Part of the grade includes evaluation of each team member's positive contributions. Select the three statements that best demonstrate your ability to contribute productively to a group. (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Agree with your teacher's recommendations on the division for the project's scope." },
      { id: 'B', text: "Agree to a set of norms concerning the online group conversation." },
      { id: 'C', text: "Save discussion of deliverable format until a later meeting." },
      { id: 'D', text: "Set a series of deadlines throughout the project to keep all members accountable." },
      { id: 'E', text: "Do extra work to compensate for group members who are not doing their share." }
    ],
    correctAnswers: ['A', 'B', 'D']
  },
  {
    id: 7,
    prompt: "You see that a classmate has posted content on social media that seems concerning and out of character. For each of the four proposed courses of action, mark True if it is something you should do, or False if it is not an appropriate course of action:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Respond in the comments of the post with questions about their mental state.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's2',
        text: "Report the content to have it removed, saving your classmate embarrassment and consequences.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's3',
        text: "Take screenshots of the content to show to a trusted adult so they can offer additional support(s).",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's4',
        text: "Assume that they are posting impulsively and ignore the post.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      }
    ]
  },
  {
    id: 8,
    prompt: "Which two actions describe ways to protect individual and corporate intellectual property? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Create a digital portfolio that is accessible to everyone on the internet." },
      { id: 'B', text: "Put a disclaimer in all your posts stating that all content is your intellectual property." },
      { id: 'C', text: "Place a watermark over all publicly shared content." },
      { id: 'D', text: "Create a Creative Commons license, allowing others to use your work with attribution." }
    ],
    correctAnswers: ['C', 'D']
  }
];
