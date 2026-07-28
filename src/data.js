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
  },
  {
    id: 9,
    prompt: "You customize your installation of Google Chrome. You are unhappy with some of the changes. You need to return Google Chrome to its default state by using only one command on the Settings menu shown. Which command should you select?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "You and Google" },
      { id: 'B', text: "Appearance" },
      { id: 'C', text: "Default browser" },
      { id: 'D', text: "On startup" },
      { id: 'E', text: "Reset and clean up" }
    ],
    correctAnswers: ['E']
  },
  {
    id: 10,
    prompt: "You are conducting online research. When should you use a Boolean search? Complete the sentences by selecting the correct option from each drop-down list:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "To narrow the search results by requiring all terms:",
        options: ['AND operator', 'OR operator', 'NOT operator'],
        correctAnswer: 'AND operator'
      },
      {
        id: 's2',
        text: "To expand the search results by including alternative terms:",
        options: ['AND operator', 'OR operator', 'NOT operator'],
        correctAnswer: 'OR operator'
      },
      {
        id: 's3',
        text: "To filter the search results by excluding specific terms:",
        options: ['AND operator', 'OR operator', 'NOT operator'],
        correctAnswer: 'NOT operator'
      }
    ]
  },
  {
    id: 11,
    prompt: "What is software that adds features to your web browser or to programs you use in your browser?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Browser extensions" },
      { id: 'B', text: "Browser lists" },
      { id: 'C', text: "Browser bookmarks" },
      { id: 'D', text: "Browser settings" }
    ],
    correctAnswers: ['A']
  },
  {
    id: 12,
    prompt: "Your teacher has assigned a group project. Part of the grade includes evaluation of each team member's positive contributions. Select the three statements that best demonstrate your ability to contribute productively to a group. (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Save discussion of deliverable format until a later meeting." },
      { id: 'B', text: "Set a series of deadlines throughout the project to keep all members accountable." },
      { id: 'C', text: "Agree with your teacher's recommendations on the division for the project's scope." },
      { id: 'D', text: "Agree to a set of norms concerning the online group conversation." },
      { id: 'E', text: "Do extra work to compensate for group members who are not doing their share." }
    ],
    correctAnswers: ['B', 'C', 'D']
  },
  {
    id: 13,
    prompt: "You are researching apples on the internet. For each of the four research topics, select Yes if a Boolean search will help to identify relevant results faster or No if it will not:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Apple varieties",
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      },
      {
        id: 's2',
        text: "History of apple agriculture",
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      },
      {
        id: 's3',
        text: "Recipes for apple pie or cake",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      },
      {
        id: 's4',
        text: "Macintosh apples, but not the Macintosh computer",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      }
    ]
  },
  {
    id: 14,
    prompt: "Electronic waste (e-waste) refers to used electronics that are discarded, donated, or given to a recycler. For each of the four statements about e-waste, select True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Over 60% of e-waste is recycled",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's2',
        text: "E-waste is the slowest growing form of waste worldwide",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's3',
        text: "E-waste contains precious metals like gold and silver that can be recovered and reused",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's4',
        text: "E-waste contains toxic metals like lead and mercury that cause human illnesses if they leach into groundwater",
        options: ['True', 'False'],
        correctAnswer: 'True'
      }
    ]
  },
  {
    id: 15,
    prompt: "For each of the three statements about practices designed to keep your knowledge and awareness of new technologies current, select whether it is True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Understanding monetization and employment practices will give you a better sense of the motivations behind the content that you consume online",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's2',
        text: "Using public beta applications can offer hints at adoption of industry trends and technology updates",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's3',
        text: "Due to editing and researching requirements, broadcast news has the highest standards in terms of coverage accuracy, timeliness and rigor",
        options: ['True', 'False'],
        correctAnswer: 'False'
      }
    ]
  },
  {
    id: 16,
    prompt: "For each of the four statements about documents using a cloud storage software as part of their workflow, determine whether statement is True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Cloud documents cannot function without an active internet connection",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's2',
        text: "Cloud documents have various degrees of security to control who does or does not have the ability to view them",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's3',
        text: "Cloud documents can be configured to allow the recipient to view the document, leave comments on the document, or change the document",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's4',
        text: "Cloud documents must always be actively uploaded from your computer to a cloud storage account",
        options: ['True', 'False'],
        correctAnswer: 'False'
      }
    ]
  },
  {
    id: 17,
    prompt: "You want to make sure your laptop computer can run a new software application.\n\nSystem requirements:\n• Minimum: 64-bit dual core 2GHz CPU with SSE2 support, 4 GB RAM, 1280x720 display, Graphics card with 1 GB RAM\n• Recommended: 64-bit quad core CPU, 16 GB RAM, 1366x768 display, Graphics card with 4 GB RAM\n• Optimal: 64-bit eight core CPU, 32 GB RAM, 1920x1080 display, Graphics card with 12 GB RAM\n\nLaptop specs: 64-bit dual core 2GHz CPU, 32 GB RAM, 1920x1080 display, Graphics card with 2 GB RAM.\n\nWhich statement is correct?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "This laptop meets the optimal system requirements" },
      { id: 'B', text: "This laptop meets the recommended system requirements" },
      { id: 'C', text: "This laptop meets the minimum system requirements" },
      { id: 'D', text: "This laptop does not meet the minimum system requirements" }
    ],
    correctAnswers: ['C']
  },
  {
    id: 18,
    prompt: "Which two actions will improve the readability of a document? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Set the line spacing so there is a slight distance between each line of text." },
      { id: 'B', text: "Select a font family that is unique, decorative, and in line with modern trends." },
      { id: 'C', text: "Carefully choose a font color with strong contrast against the background." },
      { id: 'D', text: "Use a small, compact font size to prevent paragraphs from breaking across pages." },
      { id: 'E', text: "Type in all caps to make the text more uniform in appearance." }
    ],
    correctAnswers: ['A', 'C']
  },
  {
    id: 19,
    prompt: "After meeting with a client, the client told your teacher that your team needs to improve its communication skills. Which two actions should you take to improve your communication skills? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Continue the same approach so your team can improve with practice." },
      { id: 'B', text: "Individually text the client to apologize for your poor communication." },
      { id: 'C', text: "Ask your teacher for feedback on which communication skills you need to improve." },
      { id: 'D', text: "When talking with the client, speak in a positive, respectful tone." },
      { id: 'E', text: "Have another team member take over the communication at the next meeting." }
    ],
    correctAnswers: ['C', 'D']
  },
  {
    id: 20,
    prompt: "Which two practices are recommended to help you stay informed about current digital threats, scams, and security breaches for a digital app that you use? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Pay attention to app notifications for software updates and terms of use changes from the app publisher." },
      { id: 'B', text: "Subscribe to email alerts for the app publisher's latest marketing offers and special discounts." },
      { id: 'C', text: "Review the app publisher's website once a year for updates and news." },
      { id: 'D', text: "Follow a variety of social media accounts that post independent content about digital tools." }
    ],
    correctAnswers: ['A', 'D']
  },
  {
    id: 21,
    prompt: "You copy a 30-second video clip from the internet. You do not know who created the video. Which scenario would NOT be fair use of the video clip?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "You create a political ad that includes the video clip." },
      { id: 'B', text: "You use the video clip as part of a news report." },
      { id: 'C', text: "You create a parody that includes the video clip." },
      { id: 'D', text: "You use the video clip to teach." }
    ],
    correctAnswers: ['A']
  },
  {
    id: 22,
    prompt: "You are preparing a presentation on the population increase in your city over the years. You need to effectively represent the population growth over time. Which two types of visual representation would be most effective? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Line graph" },
      { id: 'B', text: "Bar graph" },
      { id: 'C', text: "Map" },
      { id: 'D', text: "Pie chart" }
    ],
    correctAnswers: ['A', 'B']
  },
  {
    id: 23,
    prompt: "You design a website for your school to track student involvement in clubs. You arrange a usability test to find out how well students can use the website. Which two actions should you take to ensure you get good test data? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Show the students how to use the website." },
      { id: 'B', text: "Listen to the students and record any questions they have about how to use the site." },
      { id: 'C', text: "Watch the students use the website and note whether they have problems." },
      { id: 'D', text: "Tell the students why the school asked you to create the website." }
    ],
    correctAnswers: ['B', 'C']
  },
  {
    id: 24,
    prompt: "In which two ways do cloud computing data centers negatively impact the environment? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "They are often built in urban environments, which leads to increased air pollution." },
      { id: 'B', text: "They generate massive amounts of heat, which raises the temperature of nearby bodies of water." },
      { id: 'C', text: "They are usually built in cold climates, damaging habitats for polar bears and other wildlife." },
      { id: 'D', text: "They use a significant amount of electricity that is derived from non-renewable energy sources." }
    ],
    correctAnswers: ['B', 'D']
  },
  {
    id: 25,
    prompt: "Which three types of authentication factors are used to prove your identity when you use multifactor authentication? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Something you have" },
      { id: 'B', text: "Something you calculate" },
      { id: 'C', text: "Something you make" },
      { id: 'D', text: "Something you research" },
      { id: 'E', text: "Something you know" },
      { id: 'F', text: "Something you are" }
    ],
    correctAnswers: ['A', 'E', 'F']
  },
  {
    id: 26,
    prompt: "You are trying to access a website, but it is not loading properly on your browser. What should you try first?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Remove unnecessary apps" },
      { id: 'B', text: "Email the website owner" },
      { id: 'C', text: "Clear the browser cache" },
      { id: 'D', text: "Check the BIOS settings" }
    ],
    correctAnswers: ['C']
  },
  {
    id: 27,
    prompt: "For each of the four statements about digital communications with clients and coworkers, select True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Avoid directly stating the purpose of the message",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's2',
        text: "Use bullet points or lists to organize message details",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's3',
        text: "Use acronyms and abbreviations in all messages to keep them brief",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's4',
        text: "When you need a client to make a choice, provide multiple options to minimize back-and-forth",
        options: ['True', 'False'],
        correctAnswer: 'True'
      }
    ]
  },
  {
    id: 28,
    prompt: "Which two video editing methods are used to alter videos to change the original meaning of the content? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Show a brief clip of a longer segment of the video" },
      { id: 'B', text: "Edit together pieces of different videos" },
      { id: 'C', text: "At the end of the video, show links to credible sources that support the message of the video" },
      { id: 'D', text: "Identify the people in the video and the cameraperson in credits at the end of the video" }
    ],
    correctAnswers: ['A', 'B']
  },
  {
    id: 29,
    prompt: "Your group members need to be informed of a change in plans for the next meeting. Which response is the most efficient choice?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Send an email to the group about the change." },
      { id: 'B', text: "Call them each individually" },
      { id: 'C', text: "Send an email to your instructor" },
      { id: 'D', text: "Post the change to your social media account" }
    ],
    correctAnswers: ['A']
  },
  {
    id: 30,
    prompt: "Your school asks you to design a website to track participation in student clubs. You gather your team to generate ideas to solve the problem. Which two actions will help the idea-generation process? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Only share ideas you're very confident about." },
      { id: 'B', text: "Withhold criticism of your peers' ideas." },
      { id: 'C', text: "Limit each team member to one or two ideas." },
      { id: 'D', text: "Encourage wild ideas." }
    ],
    correctAnswers: ['B', 'D']
  },
  {
    id: 31,
    prompt: "You are experiencing problems after a recent update. To troubleshoot, you decide to check the version of the operating system and the application in question. Where should you look for this information?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "BIOS settings" },
      { id: 'B', text: "Task manager" },
      { id: 'C', text: "System settings" },
      { id: 'D', text: "Device manager" }
    ],
    correctAnswers: ['C']
  },
  {
    id: 32,
    prompt: "A story about a college test prep study guide appears in your social media news feed. The story contains information about a 10-student sample showing 25% score increase and expert quotes stating students might not get admitted without it. Which two logical fallacies does the story contain? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "False dilemma: limiting the possible choices to avoid consideration of another choice" },
      { id: 'B', text: "Ad hominem (\"against the person\"): attacking the person and not the issue" },
      { id: 'C', text: "Red herring: presenting an irrelevant topic to divert attention from the original issue" },
      { id: 'D', text: "Hasty generalization: drawing a conclusion about a population based on a small sample" }
    ],
    correctAnswers: ['A', 'D']
  },
  {
    id: 33,
    prompt: "Move each content type from the list on the left to the most appropriate application for presenting the content on the right:",
    type: "MATCHING TASK",
    sourceItems: [
      { id: 'src1', text: "A large data set that you manipulate by using formulas" },
      { id: 'src2', text: "A visual presentation that automatically advances through multiple topics on an unattended computer" },
      { id: 'src3', text: "A multiple-page project proposal with an automatically generated table of contents and index" }
    ],
    targetAreas: [
      { id: 'tgt1', label: "Microsoft Excel", correctAnswer: 'src1' },
      { id: 'tgt2', label: "Microsoft PowerPoint", correctAnswer: 'src2' },
      { id: 'tgt3', label: "Microsoft Word", correctAnswer: 'src3' }
    ]
  },
  {
    id: 34,
    prompt: "You see a video online that you suspect has been digitally manipulated. You are trying to determine if the video has been altered. For each of the four statements, select True if it will help you determine if the video is trustworthy or False if it will not:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Because the video contains a statement that the speaker is not likely to make, you can assume the video is real",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's2',
        text: "Search for some of the specific quotes from the video online to see if they are being featured by national news organizations",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's3',
        text: "Consider the motivations of the source that originally posted the video",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's4',
        text: "Check the comments on the video to see if others have made accusations about the video being fabricated",
        options: ['True', 'False'],
        correctAnswer: 'True'
      }
    ]
  },
  {
    id: 35,
    prompt: "Your Windows 10 computer has Microsoft Edge, Microsoft Internet Explorer, and Google Chrome installed. Every time you click a link to a website in an email message, the website opens in Microsoft Edge. You want to open links in Google Chrome instead. In Windows 10, where can you configure this setting?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Email Privacy Settings" },
      { id: 'B', text: "Notifications" },
      { id: 'C', text: "Default Apps" },
      { id: 'D', text: "Task Manager" }
    ],
    correctAnswers: ['C']
  },
  {
    id: 36,
    prompt: "Which three actions are good strategies for being a successful member of a team? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Be prompt and focused during meetings." },
      { id: 'B', text: "Use reply all to keep everyone up to date." },
      { id: 'C', text: "Share and accept feedback during the process." },
      { id: 'D', text: "Never pressure team members about deadlines." },
      { id: 'E', text: "Keep the discussion light and lively." },
      { id: 'F', text: "Use team messaging to collaborate with tips and ideas." }
    ],
    correctAnswers: ['A', 'C', 'F']
  },
  {
    id: 37,
    prompt: "You work for a company with a strict security policy. A coworker shares their password with you. For each of the three statements, select True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "If you use someone else's password, your employer can restrict your future access to the company network",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's2',
        text: "Using a coworker's password to sign them into the company network because they are late for work is fraud",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's3',
        text: "If multiple people know a coworker's password and a security breach occurs, they could all be held responsible",
        options: ['True', 'False'],
        correctAnswer: 'True'
      }
    ]
  },
  {
    id: 38,
    prompt: "You are adding alt text to the images on your website. For each of the three types of information, select Yes if it is necessary to include it in the alt-text or No if it is not:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "The image copyright",
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      },
      {
        id: 's2',
        text: "A brief description of the image",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      },
      {
        id: 's3',
        text: "Context and details relevant to the image purpose",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      }
    ]
  },
  {
    id: 40,
    prompt: "Which of the following files can you NOT send through a standard email provider such as Gmail or Yahoo?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "A 400-page plain-text file" },
      { id: 'B', text: "A 30-frame 1080p-resolution animated GIF" },
      { id: 'C', text: "A 5-minute podcast in MP3 format" },
      { id: 'D', text: "A 1-minute 8K-resolution video in AVI format" }
    ],
    correctAnswers: ['D']
  },
  {
    id: 39,
    prompt: "You receive a question about an app you are supporting. Which three responses are appropriate? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Send positive message with several emojis." },
      { id: 'B', text: "Send annotated, sequential screenshots." },
      { id: 'C', text: "Provide clear and concise instructions." },
      { id: 'D', text: "Share links to video content with useful steps." },
      { id: 'E', text: "Notify them that that is likely user error." }
    ],
    correctAnswers: ['B', 'C', 'D']
  },
  {
    id: 41,
    prompt: "You are the assistant coach of an adult soccer league. You collect registration information from each player. You decide to create a team contact list. Which information can you NOT share without the player's permission?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Team name and position" },
      { id: 'B', text: "City of residence" },
      { id: 'C', text: "First name and last name" },
      { id: 'D', text: "Allergies" }
    ],
    correctAnswers: ['D']
  },
  {
    id: 42,
    prompt: "Your class recently completed group projects. You are preparing a presentation about your group's project. Your group will deliver your presentation live, and it will be livestreamed for remote viewers. You need to ensure that the remote audience watches and listens to your presentation. Which two actions will increase the audience engagement during your presentation? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Have group members take turns presenting information." },
      { id: 'B', text: "Speak in a soothing monotone." },
      { id: 'C', text: "Encourage participation with polls or questions requiring virtual hand-raising." },
      { id: 'D', text: "Clearly read aloud the content of each presentation slide." }
    ],
    correctAnswers: ['A', 'C']
  },
  {
    id: 43,
    prompt: "Which two options help keep data secure in the workplace? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Shut computers down at night." },
      { id: 'B', text: "Report suspicious emails." },
      { id: 'C', text: "Allow workers to share computers." },
      { id: 'D', text: "Use strong passwords." }
    ],
    correctAnswers: ['B', 'D']
  },
  {
    id: 44,
    prompt: "Which action best demonstrates an understanding of intellectual property guidelines when reusing someone's work?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Providing attribution after adhering to fair use principles" },
      { id: 'B', text: "Using small portions of the work under the assumption that it falls under fair use" },
      { id: 'C', text: "Making sure you modify the original work slightly and then present it as your own" },
      { id: 'D', text: "Crediting the original source in a bibliography instead of using direct in-text citations" }
    ],
    correctAnswers: ['A']
  },
  {
    id: 45,
    prompt: "Match each authentication factor type with its examples:",
    type: "MATCHING TASK",
    sourceItems: [
      { id: 'src1', text: "Fingerprints and facial recognition" },
      { id: 'src2', text: "Smartphones and employee access cards" },
      { id: 'src3', text: "Passwords and personal identification numbers (PINs)" }
    ],
    targetAreas: [
      { id: 'tgt1', label: "Biometric authentication factors", correctAnswer: 'src1' },
      { id: 'tgt2', label: "Physical authentication factors", correctAnswer: 'src2' },
      { id: 'tgt3', label: "Logical authentication factors", correctAnswer: 'src3' }
    ]
  },
  {
    id: 46,
    prompt: "Move each visual representation goal from the list on the left to its most effective visual format on the right:",
    type: "MATCHING TASK",
    sourceItems: [
      { id: 'src1', text: "Show how one or more data series change over time" },
      { id: 'src2', text: "Illustrate simple part-to-whole relationships within a small data set" },
      { id: 'src3', text: "Show the correlation and distribution of a large amount of data" }
    ],
    targetAreas: [
      { id: 'tgt1', label: "Line graph", correctAnswer: 'src1' },
      { id: 'tgt2', label: "Pie chart", correctAnswer: 'src2' },
      { id: 'tgt3', label: "Scatter plot", correctAnswer: 'src3' }
    ]
  },
  {
    id: 47,
    prompt: "You post a video on your company's website. Site users complain that the video takes a long time to load. You need to decrease the video loading time. For each of the four actions, select Yes if it will make the video load faster or No if it will not:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Increase the video bitrate",
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      },
      {
        id: 's2',
        text: "Convert the video to HTML5",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      },
      {
        id: 's3',
        text: "Decrease the video resolution",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      },
      {
        id: 's4',
        text: "Replace the video with an uncompressed version",
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      }
    ]
  },
  {
    id: 48,
    prompt: "You are working with internal team members to solve a hardware issue. Which three solutions would be most helpful? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Provide possible solutions." },
      { id: 'B', text: "Focus on how tough the task is going to be." },
      { id: 'C', text: "Provide reasons a solution is not possible." },
      { id: 'D', text: "Collaborate via team messaging with tips and ideas." },
      { id: 'E', text: "Share websites about software design." },
      { id: 'F', text: "Share screenshots demonstrating the issue." }
    ],
    correctAnswers: ['A', 'D', 'F']
  },
  {
    id: 49,
    prompt: "You need to appropriately protect your personally identifiable information (PII). For each of the three statements, select True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "The PII collected by websites can be used for identity theft purposes.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's2',
        text: "Using multifactor authentication increases the risk of outsiders accessing your PII.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's3',
        text: "Closing an online account permanently deletes your PII from the website hosting server.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      }
    ]
  },
  {
    id: 50,
    prompt: "Which statement describes the principles of cloud versioning?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Cloud versioning requires users to manually save every version of their files." },
      { id: 'B', text: "Cloud versioning keeps a history of changes made to a file." },
      { id: 'C', text: "Cloud versioning allows users to save only the most recent version of a file." },
      { id: 'D', text: "Cloud versioning enables users to create multiple copies of a file." }
    ],
    correctAnswers: ['B']
  },
  {
    id: 51,
    prompt: "McKenna is setting up a new social media account and is asked to enable multifactor authentication. What is the main purpose of enabling this feature?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "To create a more complex password for your account" },
      { id: 'B', text: "To allow your friends to easily find you online" },
      { id: 'C', text: "To change your password every month" },
      { id: 'D', text: "To confirm your identity" }
    ],
    correctAnswers: ['D']
  },
  {
    id: 52,
    prompt: "What are two traits of a constructive team member? (Choose 2.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 2,
    options: [
      { id: 'A', text: "Rigid" },
      { id: 'B', text: "Opinionated" },
      { id: 'C', text: "Inquisitive" },
      { id: 'D', text: "Confident" }
    ],
    correctAnswers: ['C', 'D']
  },
  {
    id: 53,
    prompt: "What is a benefit of using a cyclical design process to create digital products?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "It allows you to deliver the final product as quickly as possible with few changes." },
      { id: 'B', text: "It allows you to follow a strict schedule with a definite ending deadline." },
      { id: 'C', text: "It allows you to work independently, without needing to ask for input from other team members." },
      { id: 'D', text: "It allows you to continually test and improve the product to achieve the best possible result." }
    ],
    correctAnswers: ['D']
  },
  {
    id: 54,
    prompt: "You are using Microsoft Word on a Windows 10 computer to write a paper about a company. The company name, ABusiness, begins with two capital letters. Each time you type the company name, the software corrects the capital letters. Where can you change this correction preference?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "In the Office Language Preferences" },
      { id: 'B', text: "In the AutoCorrect Options settings" },
      { id: 'C', text: "In the Grammar & Refinements settings" },
      { id: 'D', text: "In the computer operating system preferences" }
    ],
    correctAnswers: ['B']
  },
  {
    id: 55,
    prompt: "For each of the four statements about website credibility and accuracy, select True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Web pages are more credible if they cite sources for their content.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's2',
        text: "You know a source is reliable when the website address ends in .org.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's3',
        text: "Consulting multiple sources is a good way to determine a site's accuracy.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's4',
        text: "A search engine differentiates between good and bad sites. The first results are usually the most reliable.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      }
    ]
  },
  {
    id: 56,
    prompt: "You open a small business. You and your employees will use the Microsoft Office suite of productivity software. You need to decide whether to install the desktop apps or use the online version. What is a benefit of using a desktop app rather than a cloud app?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "The software is updated more frequently." },
      { id: 'B', text: "The software does not depend on an internet connection." },
      { id: 'C', text: "The up-front cost is less." },
      { id: 'D', text: "The software uses less hard disk drive storage space." }
    ],
    correctAnswers: ['B']
  },
  {
    id: 57,
    prompt: "Isaac's online banking app asks for a code from his phone in addition to his password. What is this an example of?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "A password reset prompt" },
      { id: 'B', text: "Identity monitoring notification" },
      { id: 'C', text: "Multifactor authentication" },
      { id: 'D', text: "A phishing attempt" }
    ],
    correctAnswers: ['C']
  },
  {
    id: 58,
    prompt: "You are creating content for a website. You need to follow accessibility standards. Complete the sentences by selecting the correct option from each drop-down list:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "The preferred font style is:",
        options: ['sans serif', 'serif', 'script'],
        correctAnswer: 'sans serif'
      },
      {
        id: 's2',
        text: "The minimum recommended font size for website body text is:",
        options: ['12 points/16 pixels', '8 points/10 pixels', '24 points/32 pixels'],
        correctAnswer: '12 points/16 pixels'
      },
      {
        id: 's3',
        text: "You should maintain a between font color and background color:",
        options: ['high contrast', 'low contrast', 'no contrast'],
        correctAnswer: 'high contrast'
      }
    ]
  },
  {
    id: 59,
    prompt: "Experts are concerned that society will lose some skills because of reliance on technology. Which three skills can become underutilized through the use of technology? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Mental math" },
      { id: 'B', text: "Memorization" },
      { id: 'C', text: "Eye-hand coordination" },
      { id: 'D', text: "Map navigation" },
      { id: 'E', text: "Organization" },
      { id: 'F', text: "Dexterity" }
    ],
    correctAnswers: ['A', 'B', 'D']
  },
  {
    id: 60,
    prompt: "You are the leader of a digital design team. Your team is creating a poster for a local fundraising event. You send a draft of the poster to the client. The client requests changes that you and your team members believe will make the poster less attractive and less effective. You need to communicate effectively with the client about the design changes. Which three actions should you take? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Focus the discussion on the design choices, rather than your emotional response to the client's changes." },
      { id: 'B', text: "Create a mockup of the poster with the client's changes and send it to the client." },
      { id: 'C', text: "Remind the client that your team has the knowledge and experience to create an effective final poster design." },
      { id: 'D', text: "Tell the client that their ideas are not welcome." },
      { id: 'E', text: "Tell the client you don't want to make the changes." },
      { id: 'F', text: "Ask the client to explain the reasons for the changes and the impact they will have on the poster." }
    ],
    correctAnswers: ['A', 'B', 'F']
  },
  {
    id: 61,
    prompt: "Which option is recommended to assist you in creating a secure password that you can remember?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Use your social media profile name." },
      { id: 'B', text: "Use parts of a random phrase." },
      { id: 'C', text: "Use your favorite color and favorite animal." },
      { id: 'D', text: "Use a name with a number at the end." }
    ],
    correctAnswers: ['B']
  },
  {
    id: 62,
    prompt: "Move each search topic from the list on the left to the corresponding type of search on the right:",
    type: "MATCHING TASK",
    sourceItems: [
      { id: 'src1', text: "Population statistics" },
      { id: 'src2', text: "A specific site" },
      { id: 'src3', text: "Third-party options to purchase software" }
    ],
    targetAreas: [
      { id: 'tgt1', label: "Informational search", correctAnswer: 'src1' },
      { id: 'tgt2', label: "Navigational search", correctAnswer: 'src2' },
      { id: 'tgt3', label: "Transactional search", correctAnswer: 'src3' }
    ]
  },
  {
    id: 63,
    prompt: "Your team is working virtually on a group project. You want the group and the project to be successful. For each of the four statements about strategies for achieving success in a virtual group, select True or False:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Have team members collect information in a shared document.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's2',
        text: "Increase efficiency by utilizing only asynchronous communication.",
        options: ['True', 'False'],
        correctAnswer: 'False'
      },
      {
        id: 's3',
        text: "Create a team discussion board for project-related conversations.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      },
      {
        id: 's4',
        text: "Have a central file storage location that all team members can access.",
        options: ['True', 'False'],
        correctAnswer: 'True'
      }
    ]
  },
  {
    id: 64,
    prompt: "You lead a project team in your digital design class. You and your teammates will create a project for a local business. You arrange a virtual meeting with the business owner to discuss the project. You need to ensure that the business owner leaves the meeting with confidence that your team can successfully complete the project. Which three actions should you take? (Choose 3.)",
    type: "MULTIPLE CHOICE",
    answersRequired: 3,
    options: [
      { id: 'A', text: "Discuss your career goals in the field of digital design." },
      { id: 'B', text: "Decide with the client which forms of digital communication to use during the project." },
      { id: 'C', text: "Tell the client that you will email a draft proposal that includes deadlines." },
      { id: 'D', text: "After the client presents ideas, paraphrase what they said." },
      { id: 'E', text: "Speak in a casual, informal manner to put the client at ease and encourage discussion." },
      { id: 'F', text: "Include a lengthy discussion about the design applications you will use." }
    ],
    correctAnswers: ['B', 'C', 'D']
  },
  {
    id: 65,
    prompt: "What is the purpose of clearing file storage space during troubleshooting?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "To remove viruses from the system" },
      { id: 'B', text: "To prevent applications from syncing with cloud storage" },
      { id: 'C', text: "To make room for new system updates" },
      { id: 'D', text: "To increase network speed" }
    ],
    correctAnswers: ['C']
  },
  {
    id: 66,
    prompt: "You need to find drivers for a Windows 10 laptop. Device Manager shows \"unknown device\" for several components. What should you do?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Use the model number of the machine to locate the Drivers page on the laptop manufacturer's website." },
      { id: 'B', text: "From Device Manager, scan for hardware changes." },
      { id: 'C', text: "Purchase device driver software from the store where the computer was purchased." },
      { id: 'D', text: "Restart the computer and use the Windows 10 repair tool." }
    ],
    correctAnswers: ['A']
  },
  {
    id: 67,
    prompt: "Which file size is the largest?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "640 kilobytes (KB)" },
      { id: 'B', text: "1.44 megabytes (MB)" },
      { id: 'C', text: "16 gigabytes (GB)" },
      { id: 'D', text: "3 petabytes (PB)" },
      { id: 'E', text: "2 terabytes (TB)" }
    ],
    correctAnswers: ['D']
  },
  {
    id: 68,
    prompt: "You are creating a flowchart. Move each symbol description from the list on the left to its corresponding symbol on the right:",
    type: "MATCHING TASK",
    sourceItems: [
      { id: 'src1', text: "Decision: indicates a decision point between two or more paths in the chart" },
      { id: 'src2', text: "Data: can represent any type of data in a flowchart" },
      { id: 'src3', text: "Terminator: indicates the beginning or end of a process" },
      { id: 'src4', text: "Delay: indicates a delay in the process" }
    ],
    targetAreas: [
      { id: 'tgt1', label: "Diamond Shape", correctAnswer: 'src1' },
      { id: 'tgt2', label: "Parallelogram Shape", correctAnswer: 'src2' },
      { id: 'tgt3', label: "Oval / Stadium Shape", correctAnswer: 'src3' },
      { id: 'tgt4', label: "Half-oval / D Shape", correctAnswer: 'src4' }
    ]
  },
  {
    id: 69,
    prompt: "For each of the four statements about technology-driven automation, select True or False:",
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
        text: "Automation will lead to the creation of new job roles.",
        options: ['True', 'False'],
        correctAnswer: 'True'
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
    id: 70,
    prompt: "You encounter a video on social media that you suspect might be a deepfake generated by AI. For each of the four statements, select Yes if the action would help you determine if the video is fake or No if it would not:",
    type: "INSTRUCTION SET",
    statements: [
      {
        id: 's1',
        text: "Assume that because the video contains a statement unlikely to be said by the speaker that the video is trustworthy.",
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      },
      {
        id: 's2',
        text: "Search online for some of the specific quotes from the video to see if they are being featured by reputable news organizations.",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      },
      {
        id: 's3',
        text: "Consider the motivations of the originators and sharers of the video.",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      },
      {
        id: 's4',
        text: "Check the comments on the video to see if there are accusations of impropriety or other issues.",
        options: ['Yes', 'No'],
        correctAnswer: 'Yes'
      }
    ]
  },
  {
    id: 71,
    prompt: "Which type of software can be used online and with iOS and Android devices?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Mac OS" },
      { id: 'B', text: "Windows 11" },
      { id: 'C', text: "Microsoft 365" },
      { id: 'D', text: "Chrome OS" }
    ],
    correctAnswers: ['C']
  },
  {
    id: 72,
    prompt: "You purchase a software program to complete a specific project. After you finish the project, a friend asks to borrow the program. You need to determine whether this is an acceptable use of the software. Where can you find this information?",
    type: "MULTIPLE CHOICE",
    answersRequired: 1,
    options: [
      { id: 'A', text: "Content Management System (CMS)" },
      { id: 'B', text: "End User License Agreement (EULA)" },
      { id: 'C', text: "Access Control List (ACL)" },
      { id: 'D', text: "Electronic Software Rating Board (ESRB)" }
    ],
    correctAnswers: ['B']
  }
];
