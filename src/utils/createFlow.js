import { ethers } from "ethers";

export function calculateFlowRate(amountInEther) {
  if (
    typeof Number(amountInEther) !== "number" ||
    isNaN(Number(amountInEther)) === true
  ) {
    console.log(typeof Number(amountInEther));
    alert("You can only calculate a flowRate based on a number");
    return;
  } else if (typeof Number(amountInEther) === "number") {
    const monthlyAmount = ethers.utils.parseEther(amountInEther.toString());
    const calculatedFlowRate = Math.floor(monthlyAmount / 3600 / 24 / 30);
    return calculatedFlowRate;
  }
}
