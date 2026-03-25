import { Types } from "mongoose"
import FoodEntry from "../models/FoodEntry.js";
interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealBreakdown: {
    breakfast: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      count: number;
    };
    lunch: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      count: number;
    };
    dinner: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      count: number;
    };
    snack: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      count: number;
    };
  };
  entries: number;
  macros: {
    protein: {
      grams: number;
      calories: number;
      percentage: number;
    };
    carbs: {
      grams: number;
      calories: number;
      percentage: number;
    };
    fat: {
      grams: number;
      calories: number;
      percentage: number;
    };
  };
}
interface MealStats {
  _id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  count: number;
}

interface OverallStats {
  _id: null;
  totalEntries: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}
interface WeeklySummary {
  dailyData: Record<
    string,
    {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      count: number;
    }
  >;
  totalEntries: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  avgCalories: number;
  macros: {
    protein: {
      grams: number;
      calories: number;
      percentage: number;
    };
    carbs: {
      grams: number;
      calories: number;
      percentage: number;
    };
    fat: {
      grams: number;
      calories: number;
      percentage: number;
    };
  };
}

export const getDailySummery=async(userid:string|Types.ObjectId,date:Date=new Date()):Promise<DailySummary>=>{
    const d = typeof date === 'string' ? new Date(date) : date;
    const startOfDay=new Date(d)
    startOfDay.setUTCHours(0,0,0,0)
    const endOfDay=new Date(d)
    endOfDay.setUTCHours(23,59,59,999)
    const userIdObjectId=typeof userid==='string'?new Types.ObjectId(userid):userid
    const[result]=await FoodEntry.aggregate<{mealStats:MealStats[],overAllStats:OverallStats[]}>([
        {
            $match:{
                userId:userIdObjectId,
                timestamp:{$gte:startOfDay,$lte:endOfDay}
            }
        },
        {
            $facet:{
                mealStats:[
                    {
                        $group:{
                            _id:"$mealType",
                            totalEntries:{$sum:1},
                            totalCalories:{$sum:"$calories"},
                            totalProtein:{$sum:"$protein"},
                            totalCarbs:{$sum:"$carbs"},
                            totalFat:{$sum:"$fat"}
                        }
                    }
                ],
                overallStats:[
                    {
                        $group:{
                            _id:null,
                            totalEntries:{$sum:1},
                            totalCalories:{$sum:"$calories"},
                            totalProtein:{$sum:"$protein"},
                            totalCarbs:{$sum:"$carbs"},
                            totalFat:{$sum:"$fat"}
                        }
                    }
                ]
            }
        }
    ])
     const summary: DailySummary = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    mealBreakdown: {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
      snack: { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
    },
    entries: 0,
    macros: {
      protein: { grams: 0, calories: 0, percentage: 0 },
      carbs: { grams: 0, calories: 0, percentage: 0 },
      fat: { grams: 0, calories: 0, percentage: 0 },
    },
  };
  if (!result || !result.overAllStats) {
    return summary; // Return the empty summary object defined earlier
}
  if (result.overAllStats.length > 0) {
    const overall = result.overAllStats[0];

    summary.totalCalories = overall.totalCalories;
    summary.totalProtein = overall.totalProtein;
    summary.totalCarbs = overall.totalCarbs;
    summary.totalFat = overall.totalFat;
    summary.entries = overall.totalEntries;
  }
  result.mealStats.forEach((meal:any)=>{
    const mealType = meal._id as keyof DailySummary["mealBreakdown"];
    if(summary.mealBreakdown[mealType]){
        summary.mealBreakdown[mealType]={
            calories: meal.totalCalories || 0,
            protein: meal.totalProtein || 0,
            carbs: meal.totalCarbs || 0,
            fat: meal.totalFat || 0,
            count: meal.totalEntries || 0,
        }
    }
  })
   const caloriesFromProtein = summary.totalProtein * 4;
  const caloriesFromCarbs = summary.totalCarbs * 4;
  const caloriesFromFat = summary.totalFat * 9;
  const totalMacrosCalories =caloriesFromProtein + caloriesFromCarbs + caloriesFromFat;
  summary.macros = {
    protein: {
      grams: summary.totalProtein,
      calories: caloriesFromProtein,
      percentage:
        totalMacrosCalories > 0
          ? Math.round(caloriesFromProtein / totalMacrosCalories) * 100
          : 0,
    },
    carbs: {
      grams: summary.totalCarbs,
      calories: caloriesFromCarbs,
      percentage:
        totalMacrosCalories > 0
          ? Math.round(caloriesFromCarbs / totalMacrosCalories) * 100
          : 0,
    },
    fat: {
      grams: summary.totalFat,
      calories: caloriesFromFat,
      percentage:
        totalMacrosCalories > 0
          ? Math.round(caloriesFromFat / totalMacrosCalories) * 100
          : 0,
    },
  };
  return summary
}
export const getWeeklySummery=async(userid:string|Types.ObjectId,weekAgo:Date,today:Date):Promise<WeeklySummary>=>{
  const userObjectId=typeof userid==="string"?new Types.ObjectId(userid):userid
  const[result]=await FoodEntry.aggregate([
    {
      $match:{
        userId:userObjectId,
        timestamp:{$gte:weekAgo,$lte:today}
      }
    } ,
    {
      $facet:{
        dailyStats:[
          {
            $group:{
              _id:{$dateToString:{format:"%Y-%m-%d",date:"$timestamp"}},
              colories:{$sum:"$calories"},
              protein:{$sum:"$protein"},
              carbs:{$sum:"$carbs"},
              fat:{$sum:"$fat"},
              count:{$sum:1}
            }
          },{
            $sort:{
              _id:1
            }
          }
        ],
        overallStats:[
          {
            $group:{
              _id:null,
              totalEntries:{$sum:1},
              totalCalories:{$sum:"$calories"},
              totalProtein:{$sum:"$protein"},
              totalCarbs:{$sum:"$carbs"},
              totalFat:{$sum:"$fat"}
            }
          }
        ]
      }
    }
  ])
  const dailydata:Record<string,{calories:number,protein:number,carbs:number,fat:number,count:number}>={}
  result.dailyStats.forEach((day:any)=>{
    dailydata[day._id]={
      calories:day.colories||0,
      protein:day.protein || 0,
      carbs:day.carbs || 0,
      fat:day.fat || 0,
      count:day.count || 0
    }
  })
   const overallStats = result.overallStats[0] || {
    totalEntries: 0,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };
   const caloriesFromProtein = overallStats.totalProtein * 4;
  const caloriesFromCarbs = overallStats.totalCarbs * 4;
  const caloriesFromFat = overallStats.totalFat * 9;
  const totalMacroCalories =caloriesFromProtein + caloriesFromCarbs + caloriesFromFat;
   return {
    dailyData: dailydata,
    totalEntries: overallStats.totalEntries,
    totalCalories: overallStats.totalCalories,
    totalProtein: overallStats.totalProtein,
    totalCarbs: overallStats.totalCarbs,
    totalFat: overallStats.totalFat,
    avgCalories:
      result.dailyStats.length > 0
        ? Math.round(overallStats.totalCalories / result.dailyStats.length)
        : 0,
    macros: {
      protein: {
        grams: overallStats.totalProtein,
        calories: caloriesFromProtein,
        percentage:
          totalMacroCalories > 0
            ? Math.round(caloriesFromProtein / totalMacroCalories) * 100
            : 0,
      },
      carbs: {
        grams: overallStats.totalCarbs,
        calories: caloriesFromCarbs,
        percentage:
          totalMacroCalories > 0
            ? Math.round(caloriesFromCarbs / totalMacroCalories) * 100
            : 0,
      },
      fat: {
        grams: overallStats.totalFat,
        calories: caloriesFromFat,
        percentage:
          totalMacroCalories > 0
            ? Math.round(caloriesFromFat / totalMacroCalories) * 100
            : 0,
      },
    },
  };
}