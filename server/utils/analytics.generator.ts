import { Mode } from "fs";
import { Document, Model } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

export async function generateLast12MothsData<T extends Document>(
  model: Model<T>
): Promise<{ last12Months: MonthData[] }> {
  const last12Months: MonthData[] = [];

  // Create a Date object representing the current date and time
  const currentDate = new Date();

  // Add one day to the current date to move to the next day
  currentDate.setDate(currentDate.getDate() + 1);

  // Start a loop to generate date ranges for the last 12 months
  for (let i = 11; i >= 0; i--) {
    // Calculate the end date of the current month
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28
    );
    // Calculate the start date of the current month
    // const startDate = new Date(
    //   endDate.getFullYear(),
    //   endDate.getMonth(),
    //   endDate.getDate() - 28
    // );

    // Format the end date as a string with a specific format
    const monthYear = endDate.toLocaleString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // You can do something with 'startDate', 'endDate', or 'monthYear' here
  }
  return { last12Months };
}
