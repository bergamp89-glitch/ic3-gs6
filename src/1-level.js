// src/1-level.js

export const examQuestions = [
  {
    id: 1,
    prompt: "Which two options help keep data secure in the workplace? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Allow workers to share computers." },
      { id: 'B', text: "Use strong passwords." },
      { id: 'C', text: "Shut computers down at night." },
      { id: 'D', text: "Report suspicious emails." }
    ],
    correctAnswers: ['B', 'D']
  },
  {
    id: 2,
    prompt: "Which three actions can help protect your online identity? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Using the same password for all accounts." },
      { id: 'B', text: "Enabling two-factor authentication." },
      { id: 'C', text: "Updating software regularly." },
      { id: 'D', text: "Using a public Wi-Fi without VPN." },
      { id: 'E', text: "Reviewing privacy settings on social media." }
    ],
    correctAnswers: ['B', 'C', 'E']
  },
  {
    id: 3,
    prompt: "Identify the true statements regarding cloud storage. (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Cloud storage requires a constant physical connection to your device." },
      { id: 'B', text: "Data in cloud storage is typically backed up across multiple servers." },
      { id: 'C', text: "Cloud storage capacity is unlimited for all free accounts." },
      { id: 'D', text: "You can access cloud storage from any device with an internet connection." }
    ],
    correctAnswers: ['B', 'D']
  },
  {
    id: 4,
    prompt: "Which of the following are examples of collaboration software? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Microsoft Word" },
      { id: 'B', text: "Slack" },
      { id: 'C', text: "Microsoft Teams" },
      { id: 'D', text: "Adobe Photoshop" },
      { id: 'E', text: "Google Workspace" }
    ],
    correctAnswers: ['B', 'C', 'E']
  },
  {
    id: 5,
    prompt: "For each statement about technology-driven automation, select the correct option:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Automation will displace some existing job roles.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's2',
        text: "Activities that include physical tasks in unpredictable environments are more likely to be automated.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's3',
        text: "Activities that include social interactions are more likely than others to be automated.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's4',
        text: "Activities that include physical tasks in predictable environments are more likely than others to be automated.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      }
    ]
  },
  {
    id: 6,
    prompt: "You are creating a flowchart. Move each symbol description from the list on the left to its corresponding symbol on the right.",
    type: "MATCHING TASK",
    sourceItems: [
      { id: 'src1', text: "Data" },
      { id: 'src2', text: "Terminator" },
      { id: 'src3', text: "Decision" },
      { id: 'src4', text: "Delay" }
    ],
    targetAreas: [
      { id: 'tgt1', label: "FLOWCHART SYMBOL 1", correctAnswer: 'src1' },
      { id: 'tgt2', label: "FLOWCHART SYMBOL 2", correctAnswer: 'src3' },
      { id: 'tgt3', label: "FLOWCHART SYMBOL 3", correctAnswer: 'src4' },
      { id: 'tgt4', label: "FLOWCHART SYMBOL 4", correctAnswer: 'src2' }
    ]
  }
];
