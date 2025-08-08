import BallIcon from "@/icons/8BallIcon";
import RazorIcon from "@/icons/RazorIcon";
import CandyIcon from "@/icons/CandyIcon";
import DrinksIcon from "@/icons/DrinksIcon";

export type Advantage = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export const advantages: Advantage[] = [
  {
    icon: <RazorIcon className="w-10 h-10 text-white"/> ,
    title: "Walk-ins Welcome",
    description: "Feel free to pop in anytime, we enjoy the company",
  },
  {
    icon: <BallIcon className="w-10 h-10 text-white"/>,
    title: "Free Amenities",
    description: "Pool, corn hole, tv, and music are ready while you wait",
  },
  {
    icon: <DrinksIcon className="w-10 h-10 text-white"/>,
    title: "Free Drinks",
    description: "Relax and let go with a free drink of your choice",
  },
  {
    icon: <CandyIcon className="w-10 h-10 text-white"/>,
    title: "Free Snacks",
    description: "Feel free to endulge in a sweet treat",
  },
];
