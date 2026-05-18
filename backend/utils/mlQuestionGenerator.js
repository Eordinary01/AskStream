// utils/mlQuestionGenerator.js
class MLQuestionGenerator {
  constructor() {
    this.topics = {

  // ================= TECHNOLOGY =================
  technology: {
    easy: [
      { text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Core Processing Unit"], correct: 0 },
      { text: "What is RAM used for?", options: ["Permanent", "Temporary storage", "Processing", "Internet"], correct: 1 },
      { text: "Which is an input device?", options: ["Monitor", "Keyboard", "Speaker", "Printer"], correct: 1 },
      { text: "What is a browser?", options: ["OS", "Software to access web", "Hardware", "Compiler"], correct: 1 },
      { text: "What is Internet?", options: ["Device", "Network of networks", "Program", "App"], correct: 1 },
      { text: "What is software?", options: ["Programs", "Hardware", "Device", "Cable"], correct: 0 },
      { text: "What is hardware?", options: ["Programs", "Physical parts", "App", "Network"], correct: 1 },
      { text: "Which is OS?", options: ["Windows", "Chrome", "Google", "HTML"], correct: 0 },
      { text: "What is WiFi?", options: ["Cable", "Wireless network", "Device", "Software"], correct: 1 },
      { text: "What is Bluetooth?", options: ["Wireless tech", "Device", "OS", "Cable"], correct: 0 },
      { text: "Which is storage?", options: ["RAM", "ROM", "CPU", "GPU"], correct: 1 },
      { text: "What is a file?", options: ["Folder", "Data collection", "App", "Device"], correct: 1 },
      { text: "Which is mobile OS?", options: ["Android", "Windows", "Linux", "Mac"], correct: 0 },
      { text: "What is a printer?", options: ["Input", "Output", "Storage", "CPU"], correct: 1 },
      { text: "What is email?", options: ["Message system", "Hardware", "Storage", "CPU"], correct: 0 },
      { text: "What is USB?", options: ["Universal Serial Bus", "Unique Bus", "User Bus", "Unit Bus"], correct: 0 },
      { text: "What is data?", options: ["Information", "Device", "Program", "Network"], correct: 0 },
      { text: "What is cloud?", options: ["Weather", "Online storage", "Device", "Cable"], correct: 1 },
      { text: "What is mouse?", options: ["Input device", "Output", "Storage", "CPU"], correct: 0 },
      { text: "What is monitor?", options: ["Output device", "Input", "Storage", "CPU"], correct: 0 },
    ],

    medium: [
      { text: "What is HTTP?", options: ["Protocol", "Language", "Device", "DB"], correct: 0 },
      { text: "What is HTTPS?", options: ["Secure HTTP", "Language", "DB", "App"], correct: 0 },
      { text: "What is API?", options: ["Interface", "DB", "Device", "OS"], correct: 0 },
      { text: "What is Git?", options: ["Version control", "DB", "IDE", "Language"], correct: 0 },
      { text: "What is Node.js?", options: ["Runtime", "Language", "DB", "Framework"], correct: 0 },
      { text: "What is React?", options: ["Library", "DB", "OS", "Language"], correct: 0 },
      { text: "What is MongoDB?", options: ["Database", "Language", "OS", "Tool"], correct: 0 },
      { text: "What is SQL?", options: ["Query language", "OS", "Tool", "Protocol"], correct: 0 },
      { text: "What is NoSQL?", options: ["Flexible DB", "Language", "Tool", "Protocol"], correct: 0 },
      { text: "What is JSON?", options: ["Data format", "Language", "Tool", "OS"], correct: 0 },
      { text: "What is REST?", options: ["Architecture", "Language", "Protocol", "DB"], correct: 0 },
      { text: "What is Docker?", options: ["Container tool", "Language", "DB", "OS"], correct: 0 },
      { text: "What is Kubernetes?", options: ["Orchestration", "DB", "Tool", "OS"], correct: 0 },
      { text: "What is JWT?", options: ["Auth token", "DB", "Protocol", "Tool"], correct: 0 },
      { text: "What is OAuth?", options: ["Auth framework", "DB", "Protocol", "Tool"], correct: 0 },
      { text: "What is caching?", options: ["Speed improve", "Storage", "Security", "Protocol"], correct: 0 },
      { text: "What is load balancing?", options: ["Traffic distribution", "Storage", "Security", "Tool"], correct: 0 },
      { text: "What is GraphQL?", options: ["Query language", "DB", "Tool", "Protocol"], correct: 0 },
      { text: "What is WebSocket?", options: ["Realtime protocol", "DB", "Tool", "OS"], correct: 0 },
      { text: "What is CI/CD?", options: ["Deployment pipeline", "Language", "DB", "Tool"], correct: 0 },
    ],

    hard: [
      { text: "Binary search complexity?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1 },
      { text: "Worst quicksort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 2 },
      { text: "What is closure?", options: ["Scope access", "Loop", "Class", "Variable"], correct: 0 },
      { text: "What is event loop?", options: ["Async model", "Thread", "Loop", "Queue"], correct: 0 },
      { text: "What is hoisting?", options: ["Variable lifting", "Loop", "Function", "Scope"], correct: 0 },
      { text: "What is memoization?", options: ["Caching", "Sorting", "Loop", "Thread"], correct: 0 },
      { text: "What is debounce?", options: ["Delay exec", "Loop", "Thread", "Cache"], correct: 0 },
      { text: "What is throttle?", options: ["Limit calls", "Loop", "Cache", "Thread"], correct: 0 },
      { text: "What is normalization?", options: ["DB structuring", "Query", "Index", "Cache"], correct: 0 },
      { text: "What is indexing?", options: ["Search optimization", "Storage", "Cache", "Protocol"], correct: 0 },
      { text: "What is ACID?", options: ["DB properties", "Protocol", "Language", "Tool"], correct: 0 },
      { text: "What is CAP theorem?", options: ["Distributed tradeoff", "DB", "Protocol", "Tool"], correct: 0 },
      { text: "What is sharding?", options: ["Data split", "Cache", "Protocol", "Index"], correct: 0 },
      { text: "What is microservices?", options: ["Architecture", "DB", "Protocol", "Tool"], correct: 0 },
      { text: "What is monolith?", options: ["Single system", "DB", "Tool", "Protocol"], correct: 0 },
      { text: "What is race condition?", options: ["Concurrency bug", "Loop", "Cache", "Thread"], correct: 0 },
      { text: "What is deadlock?", options: ["Blocking issue", "Cache", "Protocol", "Loop"], correct: 0 },
      { text: "What is virtualization?", options: ["VM tech", "Cache", "Protocol", "Loop"], correct: 0 },
      { text: "What is multithreading?", options: ["Parallel exec", "Cache", "Protocol", "Loop"], correct: 0 },
      { text: "What is distributed system?", options: ["Multiple nodes", "Cache", "Protocol", "Loop"], correct: 0 },
    ]
  },

  // ================= SCIENCE =================
  science: {
    easy: [
      { text: "H2O is?", options: ["Oxygen", "Water", "Hydrogen", "Carbon"], correct: 1 },
      { text: "Sun is?", options: ["Planet", "Star", "Satellite", "Comet"], correct: 1 },
      { text: "Human heart chambers?", options: ["2", "3", "4", "5"], correct: 2 },
      { text: "Boiling point of water?", options: ["50°C", "100°C", "150°C", "200°C"], correct: 1 },
      { text: "Earth is?", options: ["Planet", "Star", "Comet", "Galaxy"], correct: 0 },
      { text: "Oxygen symbol?", options: ["O", "Ox", "Og", "On"], correct: 0 },
      { text: "Speed of sound?", options: ["343 m/s", "100 m/s", "500 m/s", "1000 m/s"], correct: 0 },
      { text: "Plants make food by?", options: ["Photosynthesis", "Respiration", "Digestion", "Fermentation"], correct: 0 },
      { text: "Moon is?", options: ["Planet", "Satellite", "Star", "Comet"], correct: 1 },
      { text: "Human bones?", options: ["206", "210", "180", "150"], correct: 0 },
      { text: "Gas we breathe?", options: ["Oxygen", "CO2", "Nitrogen", "Helium"], correct: 0 },
      { text: "Water freezes at?", options: ["0°C", "10°C", "50°C", "100°C"], correct: 0 },
      { text: "Energy unit?", options: ["Joule", "Newton", "Watt", "Volt"], correct: 0 },
      { text: "Earth layer?", options: ["Crust", "Core", "Mantle", "All"], correct: 3 },
      { text: "DNA full form?", options: ["Deoxyribo...", "Dynamic...", "Double...", "None"], correct: 0 },
      { text: "Blood color?", options: ["Red", "Blue", "Green", "Yellow"], correct: 0 },
      { text: "Which organ pumps blood?", options: ["Heart", "Lungs", "Brain", "Kidney"], correct: 0 },
      { text: "Which gas causes global warming?", options: ["CO2", "O2", "N2", "He"], correct: 0 },
      { text: "Sun energy source?", options: ["Fusion", "Fission", "Burning", "Electric"], correct: 0 },
      { text: "Human body temp?", options: ["37°C", "30°C", "40°C", "20°C"], correct: 0 },
    ],

    medium: [
      { text: "Gravity is?", options: ["Force", "Energy", "Mass", "Motion"], correct: 0 },
      { text: "Photosynthesis converts?", options: ["Light to energy", "Heat", "Motion", "Sound"], correct: 0 },
      { text: "Speed of light?", options: ["3x10^8", "3x10^6", "3x10^5", "3x10^9"], correct: 0 },
      { text: "Newton 1st law?", options: ["Inertia", "F=ma", "Action-reaction", "Energy"], correct: 0 },
      { text: "pH of neutral?", options: ["7", "0", "14", "10"], correct: 0 },
      { text: "Unit of force?", options: ["Newton", "Joule", "Watt", "Volt"], correct: 0 },
      { text: "Electric current unit?", options: ["Ampere", "Volt", "Ohm", "Watt"], correct: 0 },
      { text: "Heat transfer modes?", options: ["3", "2", "1", "4"], correct: 0 },
      { text: "Human brain part?", options: ["Cerebrum", "Heart", "Lungs", "Kidney"], correct: 0 },
      { text: "Refraction is?", options: ["Bending light", "Reflection", "Absorption", "Diffusion"], correct: 0 },
      { text: "Work formula?", options: ["F×d", "m×a", "v×t", "p×v"], correct: 0 },
      { text: "Voltage unit?", options: ["Volt", "Amp", "Ohm", "Watt"], correct: 0 },
      { text: "Magnet poles?", options: ["2", "1", "3", "4"], correct: 0 },
      { text: "Cell unit?", options: ["Life", "Energy", "Force", "Mass"], correct: 0 },
      { text: "Respiration type?", options: ["Aerobic", "Anaerobic", "Both", "None"], correct: 2 },
      { text: "Water formula?", options: ["H2O", "CO2", "O2", "H2"], correct: 0 },
      { text: "Light speed medium?", options: ["Vacuum", "Water", "Air", "Glass"], correct: 0 },
      { text: "Electric resistance?", options: ["Ohm", "Volt", "Amp", "Watt"], correct: 0 },
      { text: "Energy cannot be?", options: ["Created/destroyed", "Used", "Stored", "Transferred"], correct: 0 },
      { text: "Atom center?", options: ["Nucleus", "Electron", "Proton", "Neutron"], correct: 0 },
    ],

    hard: [
      { text: "Entropy means?", options: ["Disorder", "Order", "Energy", "Force"], correct: 0 },
      { text: "Quantum mechanics?", options: ["Atomic physics", "Motion", "Force", "Energy"], correct: 0 },
      { text: "Relativity deals with?", options: ["Space-time", "Energy", "Force", "Mass"], correct: 0 },
      { text: "Schrodinger eq?", options: ["Wave eq", "Force", "Energy", "Mass"], correct: 0 },
      { text: "Planck constant?", options: ["Quantum value", "Force", "Mass", "Energy"], correct: 0 },
      { text: "Heisenberg principle?", options: ["Uncertainty", "Energy", "Mass", "Force"], correct: 0 },
      { text: "DNA replication?", options: ["Copying DNA", "Protein", "Mutation", "Division"], correct: 0 },
      { text: "Enzyme function?", options: ["Catalyst", "Energy", "Force", "Mass"], correct: 0 },
      { text: "Ohm's law?", options: ["V=IR", "F=ma", "E=mc2", "PV=nRT"], correct: 0 },
      { text: "Maxwell eq?", options: ["Electromagnetism", "Gravity", "Motion", "Energy"], correct: 0 },
      { text: "Thermodynamics law?", options: ["Energy conservation", "Mass", "Force", "Light"], correct: 0 },
      { text: "Black hole escape?", options: ["Light cannot escape", "Everything escapes", "Energy escapes", "None"], correct: 0 },
      { text: "Photon is?", options: ["Light particle", "Mass", "Force", "Energy"], correct: 0 },
      { text: "Nuclear fusion?", options: ["Combine atoms", "Split atoms", "Energy loss", "Heat"], correct: 0 },
      { text: "Nuclear fission?", options: ["Split atoms", "Combine", "Energy loss", "Heat"], correct: 0 },
      { text: "Electric field?", options: ["Force region", "Mass", "Energy", "Heat"], correct: 0 },
      { text: "Wave nature?", options: ["Dual", "Single", "Mass", "Force"], correct: 0 },
      { text: "Atomic number?", options: ["Protons", "Electrons", "Neutrons", "Mass"], correct: 0 },
      { text: "Half-life?", options: ["Decay time", "Energy", "Mass", "Force"], correct: 0 },
      { text: "Optics studies?", options: ["Light", "Sound", "Heat", "Force"], correct: 0 },
    ]
  },

  // ================= MATHEMATICS =================
  mathematics: {
    easy: [
      { text: "2+2?", options: ["3", "4", "5", "6"], correct: 1 },
      { text: "5×2?", options: ["10", "12", "8", "6"], correct: 0 },
      { text: "10/2?", options: ["5", "4", "6", "2"], correct: 0 },
      { text: "Square of 4?", options: ["16", "8", "12", "20"], correct: 0 },
      { text: "Cube of 2?", options: ["8", "6", "4", "2"], correct: 0 },
      { text: "7+3?", options: ["10", "9", "8", "7"], correct: 0 },
      { text: "9-4?", options: ["5", "6", "7", "8"], correct: 0 },
      { text: "6×6?", options: ["36", "30", "32", "40"], correct: 0 },
      { text: "12/4?", options: ["3", "4", "2", "6"], correct: 0 },
      { text: "15+5?", options: ["20", "18", "22", "25"], correct: 0 },
      { text: "3²?", options: ["9", "6", "3", "12"], correct: 0 },
      { text: "√16?", options: ["4", "2", "8", "6"], correct: 0 },
      { text: "8+2?", options: ["10", "9", "8", "7"], correct: 0 },
      { text: "10-5?", options: ["5", "6", "4", "3"], correct: 0 },
      { text: "2×10?", options: ["20", "10", "15", "25"], correct: 0 },
      { text: "14/2?", options: ["7", "6", "8", "9"], correct: 0 },
      { text: "5³?", options: ["125", "25", "15", "50"], correct: 0 },
      { text: "√25?", options: ["5", "4", "6", "3"], correct: 0 },
      { text: "20+10?", options: ["30", "25", "35", "40"], correct: 0 },
      { text: "50-20?", options: ["30", "25", "20", "40"], correct: 0 },
    ],

    medium: [
      { text: "Value of π?", options: ["3.14", "2.71", "1.41", "4.12"], correct: 0 },
      { text: "Area of circle?", options: ["πr²", "2πr", "r²", "πd"], correct: 0 },
      { text: "2^5?", options: ["32", "16", "64", "25"], correct: 0 },
      { text: "LCM of 4,6?", options: ["12", "10", "8", "6"], correct: 0 },
      { text: "HCF of 12,18?", options: ["6", "3", "2", "9"], correct: 0 },
      { text: "Perimeter square?", options: ["4a", "a²", "2a", "a"], correct: 0 },
      { text: "Angle sum triangle?", options: ["180°", "90°", "360°", "270°"], correct: 0 },
      { text: "Mean?", options: ["Average", "Sum", "Product", "Division"], correct: 0 },
      { text: "Median?", options: ["Middle value", "Sum", "Product", "Mode"], correct: 0 },
      { text: "Mode?", options: ["Most frequent", "Average", "Middle", "Sum"], correct: 0 },
      { text: "Simple interest?", options: ["P×R×T/100", "P+R", "P×R", "T×R"], correct: 0 },
      { text: "Compound interest?", options: ["A=P(1+r)^t", "P×R", "P+R", "T×R"], correct: 0 },
      { text: "Slope formula?", options: ["y2-y1/x2-x1", "x+y", "xy", "x-y"], correct: 0 },
      { text: "Distance formula?", options: ["√((x2-x1)^2+(y2-y1)^2)", "x+y", "xy", "x-y"], correct: 0 },
      { text: "Probability?", options: ["Favorable/Total", "Total", "Favorable", "None"], correct: 0 },
      { text: "Quadratic roots?", options: ["(-b±√...)/2a", "x+y", "xy", "None"], correct: 0 },
      { text: "Sin 90°?", options: ["1", "0", "0.5", "-1"], correct: 0 },
      { text: "Cos 0°?", options: ["1", "0", "-1", "0.5"], correct: 0 },
      { text: "Tan 45°?", options: ["1", "0", "∞", "-1"], correct: 0 },
      { text: "Matrix?", options: ["Array", "Number", "Equation", "Function"], correct: 0 },
    ],

    hard: [
      { text: "Derivative x²?", options: ["2x", "x", "x²", "2"], correct: 0 },
      { text: "Integral 2x dx?", options: ["x²+C", "2x²", "x", "2"], correct: 0 },
      { text: "Limit sinx/x?", options: ["1", "0", "∞", "-1"], correct: 0 },
      { text: "Determinant?", options: ["Matrix value", "Number", "Function", "None"], correct: 0 },
      { text: "Eigenvalue?", options: ["Matrix scalar", "Vector", "Matrix", "None"], correct: 0 },
      { text: "Laplace transform?", options: ["Integral transform", "Matrix", "Vector", "None"], correct: 0 },
      { text: "Fourier transform?", options: ["Signal analysis", "Matrix", "Vector", "None"], correct: 0 },
      { text: "Taylor series?", options: ["Function expansion", "Matrix", "Vector", "None"], correct: 0 },
      { text: "Partial derivative?", options: ["Multivariable diff", "Single", "Matrix", "None"], correct: 0 },
      { text: "Gradient?", options: ["Vector derivative", "Scalar", "Matrix", "None"], correct: 0 },
      { text: "Divergence?", options: ["Vector field", "Scalar", "Matrix", "None"], correct: 0 },
      { text: "Curl?", options: ["Rotation", "Scalar", "Matrix", "None"], correct: 0 },
      { text: "Complex number?", options: ["a+bi", "Real", "Matrix", "None"], correct: 0 },
      { text: "Modulus?", options: ["Magnitude", "Angle", "Matrix", "None"], correct: 0 },
      { text: "Argument?", options: ["Angle", "Magnitude", "Matrix", "None"], correct: 0 },
      { text: "Probability distribution?", options: ["Random", "Fixed", "Matrix", "None"], correct: 0 },
      { text: "Variance?", options: ["Spread", "Mean", "Median", "Mode"], correct: 0 },
      { text: "Standard deviation?", options: ["√variance", "Mean", "Mode", "Median"], correct: 0 },
      { text: "Regression?", options: ["Prediction", "Matrix", "Vector", "None"], correct: 0 },
      { text: "Correlation?", options: ["Relation", "Matrix", "Vector", "None"], correct: 0 },
    ]
  }

};
  }
  
  generateQuestions(topic, difficulty, count = 5) {
    const topicData = this.topics[topic.toLowerCase()];
    if (!topicData || !topicData[difficulty]) {
      return [];
    }
    
    const questions = topicData[difficulty];
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count).map((q, index) => ({
      text: q.text,
      type: 'quiz',
      options: q.options.map((opt, optIndex) => ({
        text: opt,
        isCorrect: optIndex === q.correct,
      })),
      topic,
      difficulty,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
    }));
  }
  
  getAvailableTopics() {
    return Object.keys(this.topics);
  }
  
  getDifficulties() {
    return ['easy', 'medium', 'hard'];
  }
}

module.exports = new MLQuestionGenerator();