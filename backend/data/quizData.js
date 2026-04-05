export const quizzes = {
  React: [
    { question: "What is JSX?", options: ["A syntax extension for Javascript", "A backend framework", "A database query language", "A CSS preprocessor"], answer: 0 },
    { question: "What does useState do?", options: ["Deletes a component", "Declares a state variable", "Calls a database", "Handles routing"], answer: 1 },
    { question: "Which hook is used for side effects?", options: ["useEffect", "useContext", "useMemo", "useReducer"], answer: 0 },
    { question: "What is the virtual DOM?", options: ["A physical server", "A direct copy of the actual DOM kept in memory", "A CSS styling technique", "A database engine"], answer: 1 },
    { question: "How do you pass data to a child component?", options: ["Using setState", "Using Redux", "Through props", "Via context only"], answer: 2 },
  ],
  Python: [
    { question: "How do you define a function in Python?", options: ["function myFunc()", "def myFunc():", "void myFunc()", "create myFunc()"], answer: 1 },
    { question: "Which data type is mutable?", options: ["Tuple", "String", "List", "Integer"], answer: 2 },
    { question: "What is a dictionary in Python?", options: ["A collection of key-value pairs", "An ordered list", "A string formatting method", "A global variable"], answer: 0 },
    { question: "Which keyword is used to handle exceptions?", options: ["catch", "except", "error", "handle"], answer: 1 },
    { question: "What does the 'self' keyword represent in a class?", options: ["A global variable", "The instance of the class", "A static method", "A built-in module"], answer: 1 },
  ],
  "Node.js": [
    { question: "What is Node.js?", options: ["A frontend framework", "A Javascript runtime environment", "A database", "A CSS library"], answer: 1 },
    { question: "Which manager is used to install Node packages?", options: ["npx", "pip", "npm", "composer"], answer: 2 },
    { question: "What acts as the default module system in Node.js?", options: ["ES Modules", "CommonJS", "AMD", "UMD"], answer: 1 },
    { question: "Which core module is used to create a web server?", options: ["fs", "path", "http", "url"], answer: 2 },
    { question: "Is Node.js single-threaded or multi-threaded by default?", options: ["Single-threaded", "Multi-threaded", "It depends on the OS", "Node doesn't use threads"], answer: 0 },
  ],
  Java: [
    { question: "Which keyword defines an inheritance relationship?", options: ["implements", "inherits", "extends", "super"], answer: 2 },
    { question: "What is the size of an int variable?", options: ["8 bit", "16 bit", "32 bit", "64 bit"], answer: 2 },
    { question: "Which of the following is not an access modifier?", options: ["public", "private", "protected", "void"], answer: 3 },
    { question: "What is JVM?", options: ["Java Virtual Machine", "Java Value Module", "Java Void Matrix", "Java Verified Mechanism"], answer: 0 },
    { question: "Can a class extend multiple classes in Java?", options: ["Yes", "No", "Only abstract classes", "Only final classes"], answer: 1 },
  ],
  "C++": [
    { question: "Who created C++?", options: ["Dennis Ritchie", "Bjarne Stroustrup", "James Gosling", "Guido van Rossum"], answer: 1 },
    { question: "What is used to dynamically allocate memory?", options: ["malloc()", "new", "allocate", "calloc()"], answer: 1 },
    { question: "Which concept allows multiple functions with the same name?", options: ["Polymorphism", "Encapsulation", "Function Overloading", "Inheritance"], answer: 2 },
    { question: "What is the role of a destructor?", options: ["To create objects", "To initialize variables", "To destroy objects and free memory", "To throw errors"], answer: 2 },
    { question: "A pointer holds what type of value?", options: ["An integer", "A character", "A memory address", "A floating point number"], answer: 2 },
  ],
  General: [
    { question: "What is the primary purpose of version control systems like Git?", options: ["Writing code", "Tracking changes and collaborating", "Compiling software", "Designing UI"], answer: 1 },
    { question: "What does API stand for?", options: ["Application Programming Interface", "Advanced Program Integration", "Automated Process Intelligence", "Application Protocol Interface"], answer: 0 },
    { question: "Which of the following is an example of an IDE?", options: ["Google Chrome", "Adobe Photoshop", "Visual Studio Code", "Microsoft Word"], answer: 2 },
    { question: "What is the primary function of a database?", options: ["To style web pages", "To store and organize data", "To run server scripts", "To protect against viruses"], answer: 1 },
    { question: "In software development, what does 'debugging' mean?", options: ["Adding new features", "Writing documentation", "Identifying and removing errors", "Deploying to production"], answer: 2 },
  ]
};

export const getQuestionsForSkill = (skill) => {
  const q = quizzes[skill] || quizzes["General"]; // fallback for unknown skills to ensure testability
  // Return questions without the answer index
  return q.map((item, id) => ({ id, question: item.question, options: item.options }));
};

export const evaluateQuiz = (skill, answers) => {
  const q = quizzes[skill] || quizzes["General"];
  let score = 0;
  for (let i = 0; i < q.length; i++) {
    if (answers[i] === q[i].answer) score++;
  }
  return score;
};
