 let chartData = [];
 const ctx = document.getElementById("transactionChart").getContext("2d");
 const transactionChart = new Chart(ctx, {
 type: "line",
 data: {
 labels: [],
 datasets: [{
 label: "Balance (₹)",
 data: [],
 borderColor: "#1e90ff",
 backgroundColor: "rgba(30, 144, 255, 0.2)",
 borderWidth: 2
 }]
 }
 });
 function addTransaction() {
 const transactionInput = document.getElementById("transaction");
 const transactionType = document.getElementById("type").value;
 const balanceElement = document.getElementById("balance");
 const message = document.getElementById("message");
let amount = parseFloat(transactionInput.value);
 if (isNaN(amount) || amount <= 0) {
 message.innerText = "Please enter a valid amount!";
 message.style.color = "red";
 return;
 }
 let currentBalance = parseFloat(balanceElement.innerText.replace("₹", "").replace(",", ""));
 currentBalance = transactionType === "income" ? currentBalance + amount : currentBalance
amount;
 balanceElement.innerText = `₹${currentBalance.toLocaleString()}`;
 chartData.push(currentBalance);
 transactionChart.data.labels.push(`Transaction ${chartData.length}`);
 transactionChart.data.datasets[0].data.push(currentBalance);
 transactionChart.update();
 transactionInput.value = "";
 message.innerText = "Transaction added successfully!";
 message.style.color = "green";
 }
