# Bybit Trade Executor

This project is a command-line tool for executing trades on the Bybit exchange using the Bybit API. It allows users to specify trade parameters such as symbol, side (buy/sell), stop loss, take profit, and risk percentage, and calculates the position size and quantity based on the current market price and account balance.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Bybit API key and secret

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/raftheunis87/bybit-trade-executor.git
   cd bybit-trade-executor
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory and add your Bybit API key and secret:
    ```bash
    BYBIT_API_KEY=your_api_key
    BYBIT_API_SECRET=your_api_secret
    ```

## Usage

To execute a trade, run the following command:

```bash
node index.js --symbol <symbol> --side <buy|sell> --stopLoss <stop_loss_price> --takeProfit <take_profit_price> --riskPercentage <risk_percentage> [--price <limit_order_price>]
```

### Example

```bash
node index.js --symbol BTCUSDT --side buy --stopLoss 87500 --takeProfit 90000 --riskPercentage 10
```

This command will execute a buy trade for the BTCUSDT symbol with a stop loss at 85000, take profit at 100000, and risk 10% of the account balance.

If you want to specify a limit order price, you can use the --price option:

```bash
node index.js --symbol BTCUSDT --side buy --price 88400 --stopLoss 87500 --takeProfit 90000 --riskPercentage 10
```

### How It Works

1. The script fetches the current market price for the specified symbol.
2. It validates the stop loss and take profit values based on the current price.
3. It retrieves the account balance in USDT.
4. It calculates the risk amount based on the specified risk percentage.
5. It calculates the position size and quantity based on the risk amount and current price.
6. It prints the calculated trade details in a table format.
7. It prompts the user for confirmation to proceed with the trade.
8. If confirmed, it submits a market order to Bybit with the specified parameters.