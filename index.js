import { hideBin } from "yargs/helpers";
import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
import readline from "readline";
import yargs from "yargs";

dotenv.config();

const apiKey = process.env.BYBIT_API_KEY;
const apiSecret = process.env.BYBIT_API_SECRET;

const bybit = new RestClientV5({
  key: apiKey,
  secret: apiSecret,
});

async function executeTrade(
  symbol,
  side,
  price,
  stopLoss,
  takeProfit,
  riskPercentage
) {
  try {
    // Make sure that the side variable is capitalized
    side = side.charAt(0).toUpperCase() + side.slice(1).toLowerCase();

    // Step 1: Get current price to calculate position size
    let entryPrice;
    if (price) {
      entryPrice = price;
    } else {
      const tickerResponse = await bybit.getTickers({
        category: "linear",
        baseCoin: "USDT",
        symbol: symbol,
      });
      entryPrice = parseFloat(tickerResponse.result.list[0].lastPrice);
    }

    if (
      (side.toLowerCase() === "buy" &&
        (parseFloat(stopLoss) > entryPrice ||
          parseFloat(takeProfit) < entryPrice)) ||
      (side.toLowerCase() === "sell" &&
        (parseFloat(stopLoss) < entryPrice ||
          parseFloat(takeProfit) > entryPrice))
    ) {
      console.error(
        `Incorrect stop loss or take profit values for side "${side}". Exiting...`
      );
      process.exit();
    }

    // Step 2: Get account balance in USDT
    const balanceResponse = await bybit.getWalletBalance({
      accountType: "UNIFIED",
      coin: "USDT",
    });
    const balance = parseFloat(
      balanceResponse.result.list[0].totalWalletBalance
    );

    // Step 3: Calculate risk amount
    const riskAmount = balance * (riskPercentage / 100); // Risk percentage of the balance

    // Step 4: Calculate stop loss percentage
    const distanceToStoploss = Math.abs((entryPrice - stopLoss) / entryPrice);

    // Step 5: Calculate position size
    const positionSize = (riskAmount / distanceToStoploss).toFixed(0);

    // Step 5: Calculate quantity
    const quantity = (positionSize / entryPrice).toFixed(3);

    // Step 6: Print trade information
    console.log(`\nCalculated Trade Details`);
    console.table([
      { Key: "Side", Value: side },
      { Key: "Entry Price", Value: entryPrice },
      { Key: "Stop Loss", Value: stopLoss },
      { Key: "Take Profit", Value: takeProfit },
      { Key: "Risk Percentage", Value: `${riskPercentage}%` },
      { Key: "Risk Amount", Value: `${riskAmount.toFixed(2)} USDT` },
      { Key: "Position Size", Value: `${positionSize} USDT` },
      { Key: "Position Size Base Coin", Value: quantity },
    ]);

    // Ask for user confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Do you want to proceed with this trade? (yes/no) [default: yes]: ",
      async (answer) => {
        answer = answer.trim() === "" ? "yes" : answer;
        rl.close();
        if (answer.toLowerCase() !== "yes") {
          console.log("Trade canceled.");
          return;
        }

        // Step 6: Open position
        const orderParams = {
          orderType: price ? "Limit" : "Market",
          category: "linear",
          symbol: `${symbol}`,
          qty: `${quantity}`,
          side: `${side}`,
          stopLoss: `${stopLoss}`,
          takeProfit: `${takeProfit}`,
        };

        if (price) {
          orderParams.price = `${entryPrice}`;
        }

        const orderResult = await bybit.submitOrder(orderParams);

        console.log(
          `Order with id ${orderResult.result.orderId} submitted successully.`
        );
      }
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Get named arguments from command line
const argv = yargs(hideBin(process.argv))
  .option("symbol", {
    type: "string",
    demandOption: true,
    description: "Name of the symbol to trade",
  })
  .option("side", {
    type: "string",
    demandOption: true,
    description: "Trade side: Buy or Sell",
  })
  .option("price", {
    type: "number",
    demandOption: false,
    description: "Limit order price",
  })
  .option("stopLoss", {
    type: "number",
    demandOption: true,
    description: "Stop loss price",
  })
  .option("takeProfit", {
    type: "number",
    demandOption: true,
    description: "Take profit price",
  })
  .option("riskPercentage", {
    type: "number",
    demandOption: true,
    description: "Risk percentage of balance",
  })
  .help().argv;

executeTrade(
  argv.symbol,
  argv.side,
  argv.price,
  argv.stopLoss,
  argv.takeProfit,
  argv.riskPercentage
);
