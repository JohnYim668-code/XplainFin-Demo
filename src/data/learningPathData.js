// Gamified learning path data.
// Add future modules/lessons by following this same structure.
export const learningPathModules = [
  {
    id: "module-1",
    code: "Module 1",
    title: "Investment Fundamentals",
    description: "Build core investing knowledge before moving to advanced topics.",
    lessons: [
      {
        id: "lesson-1-1",
        code: "Lesson 1.1",
        title: "What Is Investing?",
        summary:
          "Learn how investing differs from saving and why long-term growth matters.",
        questions: {
          multipleChoice: [
            {
              id: "m1l1-mc-1",
              prompt: "Which of the following best describes investing?",
              options: [
                "Putting money in a no-interest checking account",
                "Allocating resources today in hopes of greater returns in the future",
                "Spending all your savings on consumer goods",
                "Taking a loan with a high interest rate"
              ],
              correctAnswer:
                "Allocating resources today in hopes of greater returns in the future"
            },
            {
              id: "m1l1-mc-2",
              prompt: "Investing differs from saving because investing typically involves:",
              options: [
                "Zero risk",
                "A guaranteed return",
                "The potential for higher growth and risk",
                "Immediate liquidity"
              ],
              correctAnswer: "The potential for higher growth and risk"
            },
            {
              id: "m1l1-mc-3",
              prompt: "Which statement is true about diversification?",
              options: [
                "It concentrates risk into one asset",
                "It spreads risk across different assets",
                "It guarantees profits",
                "It is only for professional traders"
              ],
              correctAnswer: "It spreads risk across different assets"
            },
            {
              id: "m1l1-mc-4",
              prompt: "An example of an investable asset is:",
              options: [
                "A used car that loses value",
                "Artwork expected to appreciate",
                "Candy purchased for immediate consumption",
                "A paycheck you just received"
              ],
              correctAnswer: "Artwork expected to appreciate"
            }
          ],
          trueFalse: [
            {
              id: "m1l1-tf-1",
              prompt: "Investing always guarantees you will make money.",
              answer: false
            },
            {
              id: "m1l1-tf-2",
              prompt: "You can invest in real estate, stocks, bonds, or commodities.",
              answer: true
            },
            {
              id: "m1l1-tf-3",
              prompt: "Investing and speculating are exactly the same thing.",
              answer: false
            }
          ],
          openEnded: {
            id: "m1l1-open-1",
            prompt:
              "Explain why someone might choose to invest rather than keep money under a mattress.",
            defaultAnswer:
              "Keeping money under a mattress carries the risk of theft, damage, or loss of purchasing power due to inflation. Investing offers potential growth, income from dividends or interest, and protection against inflation."
          }
        }
      },
      {
        id: "lesson-1-2",
        code: "Lesson 1.2",
        title: "Risk vs. Reward",
        summary: "Understand the tradeoff between potential gain and uncertainty.",
        questions: {
          // FIXME: Insert final quiz questions here for Lesson 1.2
          multipleChoice: [
            {
              id: "m1l2-mc-1",
              prompt: "Higher potential returns usually come with...",
              options: ["Lower uncertainty", "Higher risk", "No volatility", "Guaranteed profit"],
              correctAnswer: "Higher risk"
            }
          ],
          trueFalse: [
            {
              id: "m1l2-tf-1",
              prompt: "Low-risk assets always outperform high-risk assets.",
              answer: false
            }
          ],
          openEnded: {
            id: "m1l2-open-1",
            prompt: "How would you balance risk if your goal is 10 years away?",
            defaultAnswer:
              "Sample response: Use a diversified portfolio and adjust risk based on goals and comfort level."
          }
        }
      },
      {
        id: "lesson-1-3",
        code: "Lesson 1.3",
        title: "Time Value of Money",
        summary: "See how compounding makes early investing powerful.",
        questions: {
          // FIXME: Insert final quiz questions here for Lesson 1.3
          multipleChoice: [
            {
              id: "m1l3-mc-1",
              prompt: "Compounding means...",
              options: [
                "Interest earns interest over time",
                "Only the principal earns returns",
                "You can avoid market risk",
                "You can withdraw without consequences"
              ],
              correctAnswer: "Interest earns interest over time"
            }
          ],
          trueFalse: [
            {
              id: "m1l3-tf-1",
              prompt: "Starting earlier can increase long-term growth potential.",
              answer: true
            }
          ],
          openEnded: {
            id: "m1l3-open-1",
            prompt: "Why is time one of the most important factors in investing?",
            defaultAnswer:
              "Sample response: More time allows compound growth to work and smooths short-term market swings."
          }
        }
      }
    ]
  },
  {
    id: "module-2",
    code: "Module 2",
    title: "Market Building Blocks",
    description: "Intro to markets, portfolio design, and practical investing behavior.",
    lessons: [
      {
        id: "lesson-2-1",
        code: "Lesson 2.1",
        title: "Stocks, Bonds, and ETFs",
        summary: "Understand major asset types and how they differ.",
        questions: {
          // FIXME: Insert final quiz questions here for Module 2 lessons
          multipleChoice: [
            {
              id: "m2l1-mc-1",
              prompt: "An ETF is best described as...",
              options: [
                "A single stock",
                "A bundle of assets traded on an exchange",
                "A personal loan",
                "A checking account"
              ],
              correctAnswer: "A bundle of assets traded on an exchange"
            }
          ],
          trueFalse: [
            { id: "m2l1-tf-1", prompt: "Bonds can be affected by interest-rate changes.", answer: true }
          ],
          openEnded: {
            id: "m2l1-open-1",
            prompt: "When might an ETF be a better fit than one individual stock?",
            defaultAnswer:
              "Sample response: ETFs can offer diversification and lower single-company risk."
          }
        }
      }
    ]
  }
];
