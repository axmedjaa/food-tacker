import { Request, Response } from "express";
import User from "../models/User.js";
import { getDailySummery, getWeeklySummery,  } from "../services/clories.js";
export const getDaily = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { date } = req.query;
    const targetDate =
      date && typeof date === "string" ? new Date(date) : new Date();
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const summary = await getDailySummery(user._id.toString(), targetDate);
    const remainingCalories = user.dailyColorieGoal - summary.totalCalories;
    const percentComplete = Math.round(
      (summary.totalCalories / user.dailyColorieGoal) * 100,
    );
    res.json({
      date: targetDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      goal: user.dailyColorieGoal,
      consumed: summary.totalCalories,
      remaining: remainingCalories > 0 ? remainingCalories : 0, // Don't show negative remaining
      percentComplete,
      isOverGoal: summary.totalCalories > user.dailyColorieGoal, // Flag if user exceeded goal
      macros: summary.macros,
      mealBreakdown: summary.mealBreakdown, // Calories by meal type (breakfast, lunch, dinner, snack)
      entriesCount: summary.entries, // Total number of food entries today
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const getWeekly = async (req: Request, res: Response): Promise<void> => {
  try {
    if(!req.user){
      res.status(401).json({message:"Unauthorized"});
      return
    }
    const user=await User.findById(req.user?._id).select("-password")
    if(!user){
      res.status(401).json({message:"user not found"});
      return
    }
    const today=new Date()
    today.setHours(23,59,59,999)
    const weekAgo=new Date()
    weekAgo.setDate(weekAgo.getDate()-6)
    weekAgo.setHours(0,0,0,0)
    const summary=await getWeeklySummery(user._id,weekAgo,today)
      const dailySummry: Array<{
      date: string;
      dayName: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      entriesCount: number;
      goal: number;
      percentComplete: number;
    }> = [];
    const todayUTC = new Date(); // 2026-01-10T00:00:00.000Z;
    const todayDateStr = todayUTC.toISOString().split("T")[0];
    const[year,month,day]=todayDateStr.split("-").map(Number)
    const startDate = new Date(Date.UTC(year, month - 1, day - 6));
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate); // 2026-01-04T00:00:00.000Z;
      date.setDate(startDate.getUTCDate() + i); // 2026-01-05T00:00:00.000Z;
      const dateStr = date.toISOString().split("T")[0]; // 2026-01-05;
      const dayData = summary.dailyData[dateStr] || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        count: 0,
      }
      dailySummry.push({
        date: dateStr,
        // date.toLocaleDateString() // 2026-01-05 Sunday 04:00:00 GMT
        dayName: date.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }), // 'Mon',,
        calories: dayData.calories,
        protein: dayData.protein,
        carbs: dayData.carbs,
        fat: dayData.fat,
        entriesCount: dayData.count,
        goal: user.dailyColorieGoal,
        percentComplete: Math.round(
          (dayData.calories / user.dailyColorieGoal) * 100
        ),
      });
    } 
    res.json({
        week: dailySummry,
        totalEntries: summary.totalEntries,
        totalCalories: summary.totalCalories,
        avgCalories: summary.avgCalories,
        goal: user.dailyColorieGoal,
        macros: summary.macros,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Something went wrong"})
  }
};
export const getMonthly = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
  } catch (error) {}
};
