// Bouldering-style learning map data.
// route: yellow (beginner), green (intermediate), red (advanced)
// prerequisites: lesson IDs required to unlock this hold
// wallPosition: position on climbing wall canvas (percentage)
export const routePalette = {
  yellow: "#d8c57a",
  green: "#89b89a",
  red: "#b87884"
};

export const learningPathModules = [
  {
    id: "module-1",
    code: "V1 Base Camp",
    title: "Beginner Route - Foundations",
    description: "Build the base: spending, budgeting, and first stock concepts.",
    lessons: [
      {
        id: "lesson-yellow-1",
        code: "Y1",
        route: "yellow",
        prerequisites: [],
        wallPosition: { x: 18, y: 88 },
        title: "What Is a Stock?",
        summary: "Learn ownership, shares, and why prices move.",
        questions: {
          multipleChoice: [
            {
              id: "yl1-mc-1",
              prompt: "Buying one share of stock usually means you own...",
              options: [
                "A fixed-interest loan",
                "A part of a company",
                "A government bond",
                "A savings account"
              ],
              correctAnswer: "A part of a company"
            }
          ],
          trueFalse: [{ id: "yl1-tf-1", prompt: "Stock prices can change daily.", answer: true }],
          openEnded: {
            id: "yl1-open-1",
            prompt: "In one sentence, explain why stocks can be volatile.",
            defaultAnswer: "Stock prices move with expectations, results, and market sentiment."
          }
        }
      },
      {
        id: "lesson-yellow-2",
        code: "Y2",
        route: "yellow",
        prerequisites: ["lesson-yellow-1"],
        wallPosition: { x: 18, y: 70 },
        title: "Budgeting Basics",
        summary: "Track cash flow and build a beginner-friendly budget.",
        questions: {
          multipleChoice: [
            {
              id: "yl2-mc-1",
              prompt: "A budget is mainly used to...",
              options: [
                "Predict stock prices exactly",
                "Plan income and expenses",
                "Avoid all financial risk",
                "Replace an emergency fund"
              ],
              correctAnswer: "Plan income and expenses"
            }
          ],
          trueFalse: [{ id: "yl2-tf-1", prompt: "Budgeting can help reduce impulsive spending.", answer: true }],
          openEnded: {
            id: "yl2-open-1",
            prompt: "Name one budgeting habit that can improve savings consistency.",
            defaultAnswer: "Automating transfers to savings can improve consistency."
          }
        }
      },
      {
        id: "lesson-yellow-3",
        code: "Y3",
        route: "yellow",
        prerequisites: ["lesson-yellow-2"],
        wallPosition: { x: 18, y: 52 },
        title: "Saving vs. Investing",
        summary: "Understand when to save, when to invest, and why both matter.",
        questions: {
          multipleChoice: [
            {
              id: "yl3-mc-1",
              prompt: "Which is generally better for short-term emergency cash?",
              options: ["High-risk stocks", "Savings account", "Options contracts", "Leveraged ETFs"],
              correctAnswer: "Savings account"
            }
          ],
          trueFalse: [{ id: "yl3-tf-1", prompt: "Investing is usually for longer-term goals.", answer: true }],
          openEnded: {
            id: "yl3-open-1",
            prompt: "When would you prioritize saving over investing?",
            defaultAnswer: "Before investing, prioritize saving when you need an emergency buffer."
          }
        }
      }
    ]
  },
  {
    id: "module-2",
    code: "V3 Side Wall",
    title: "Intermediate Route - Practical Skills",
    description: "Apply real investing tools with diversification and company analysis.",
    lessons: [
      {
        id: "lesson-green-1",
        code: "G1",
        route: "green",
        prerequisites: ["lesson-yellow-1"],
        wallPosition: { x: 47, y: 78 },
        title: "Reading Balance Sheets",
        summary: "Decode assets, liabilities, and equity to evaluate company health.",
        questions: {
          multipleChoice: [
            {
              id: "gl1-mc-1",
              prompt: "The balance sheet equation is...",
              options: [
                "Revenue = Profit + Costs",
                "Assets = Liabilities + Equity",
                "Cash = Debt - Equity",
                "P/E = Price / Earnings growth"
              ],
              correctAnswer: "Assets = Liabilities + Equity"
            }
          ],
          trueFalse: [{ id: "gl1-tf-1", prompt: "Higher liabilities always mean a bad company.", answer: false }],
          openEnded: {
            id: "gl1-open-1",
            prompt: "What single balance-sheet metric would you check first, and why?",
            defaultAnswer: "Debt and cash levels help assess financial flexibility."
          }
        }
      },
      {
        id: "lesson-green-2",
        code: "G2",
        route: "green",
        prerequisites: ["lesson-green-1"],
        wallPosition: { x: 47, y: 60 },
        title: "ETF Diversification",
        summary: "Use ETFs to reduce single-stock risk and diversify efficiently.",
        questions: {
          multipleChoice: [
            {
              id: "gl2-mc-1",
              prompt: "A diversified ETF often helps by...",
              options: [
                "Eliminating all risk",
                "Spreading exposure across many holdings",
                "Guaranteeing annual gains",
                "Increasing concentration risk"
              ],
              correctAnswer: "Spreading exposure across many holdings"
            }
          ],
          trueFalse: [{ id: "gl2-tf-1", prompt: "Diversification can lower company-specific risk.", answer: true }],
          openEnded: {
            id: "gl2-open-1",
            prompt: "Why might a beginner prefer a broad market ETF?",
            defaultAnswer: "It offers broad exposure without needing to pick many individual stocks."
          }
        }
      },
      {
        id: "lesson-green-3",
        code: "G3",
        route: "green",
        prerequisites: ["lesson-green-2", "lesson-yellow-2"],
        wallPosition: { x: 47, y: 42 },
        title: "Valuation Basics",
        summary: "Use basic valuation ratios like P/E and P/B in context.",
        questions: {
          multipleChoice: [
            {
              id: "gl3-mc-1",
              prompt: "A high P/E ratio may suggest a stock is...",
              options: [
                "Always undervalued",
                "Priced for strong expected growth",
                "Guaranteed to fall",
                "Not tradable"
              ],
              correctAnswer: "Priced for strong expected growth"
            }
          ],
          trueFalse: [{ id: "gl3-tf-1", prompt: "Valuation ratios should be compared to peers.", answer: true }],
          openEnded: {
            id: "gl3-open-1",
            prompt: "How can valuation look different in growth vs. value sectors?",
            defaultAnswer: "Growth sectors may sustain higher multiples than mature value sectors."
          }
        }
      }
    ]
  },
  {
    id: "module-3",
    code: "V5 Peak Line",
    title: "Advanced Route - Market Mechanics",
    description: "Navigate complex tools like options, shorting, and margin.",
    lessons: [
      {
        id: "lesson-red-1",
        code: "R1",
        route: "red",
        prerequisites: ["lesson-green-1"],
        wallPosition: { x: 76, y: 68 },
        title: "Options Trading Basics",
        summary: "Understand calls, puts, premiums, and expiration.",
        questions: {
          multipleChoice: [
            {
              id: "rl1-mc-1",
              prompt: "A call option gives the right to...",
              options: [
                "Sell at the strike price",
                "Buy at the strike price",
                "Borrow on margin",
                "Receive dividends only"
              ],
              correctAnswer: "Buy at the strike price"
            }
          ],
          trueFalse: [{ id: "rl1-tf-1", prompt: "Options can expire worthless.", answer: true }],
          openEnded: {
            id: "rl1-open-1",
            prompt: "Why should beginners size options positions carefully?",
            defaultAnswer: "Options can move quickly, so risk can escalate without tight sizing."
          }
        }
      },
      {
        id: "lesson-red-2",
        code: "R2",
        route: "red",
        prerequisites: ["lesson-red-1", "lesson-green-2"],
        wallPosition: { x: 76, y: 50 },
        title: "Short Selling Mechanics",
        summary: "Learn how borrowing shares works and the risk of short squeezes.",
        questions: {
          multipleChoice: [
            {
              id: "rl2-mc-1",
              prompt: "Short selling profits when the stock price...",
              options: ["Rises quickly", "Stays exactly flat", "Falls", "Pays a dividend"],
              correctAnswer: "Falls"
            }
          ],
          trueFalse: [{ id: "rl2-tf-1", prompt: "Short selling has theoretically unlimited loss risk.", answer: true }],
          openEnded: {
            id: "rl2-open-1",
            prompt: "What market condition can force short sellers to exit quickly?",
            defaultAnswer: "A short squeeze can force rapid exits at higher prices."
          }
        }
      },
      {
        id: "lesson-red-3",
        code: "R3",
        route: "red",
        prerequisites: ["lesson-red-2", "lesson-green-3"],
        wallPosition: { x: 76, y: 32 },
        title: "Margin & Leverage Risk",
        summary: "Understand leverage, maintenance margin, and margin call dynamics.",
        questions: {
          multipleChoice: [
            {
              id: "rl3-mc-1",
              prompt: "Using margin mainly means you are...",
              options: [
                "Using only your own cash",
                "Borrowing funds to increase position size",
                "Buying government bonds only",
                "Avoiding portfolio volatility"
              ],
              correctAnswer: "Borrowing funds to increase position size"
            }
          ],
          trueFalse: [{ id: "rl3-tf-1", prompt: "Leverage can amplify both gains and losses.", answer: true }],
          openEnded: {
            id: "rl3-open-1",
            prompt: "How can risk management reduce margin-call probability?",
            defaultAnswer: "Lower leverage, diversified positions, and stop-loss rules can reduce margin stress."
          }
        }
      }
    ]
  }
];
