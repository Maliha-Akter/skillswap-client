import Banner from "@/components/Banner";
import FeaturedTasks from "@/components/FeaturedTasks";
import HowItWorks from "@/components/HowItWorks";
import PlatformStats from "@/components/PlatformStats";
import TopFreelancers from "@/components/TopFreelancers";

import Image from "next/image";

export default function Home() {
  return (
    <div className=" bg-zinc-50 font-sans dark:bg-black">
      <Banner></Banner>
      <FeaturedTasks></FeaturedTasks>
      <TopFreelancers></TopFreelancers>
      <HowItWorks></HowItWorks>
      <PlatformStats></PlatformStats>
    </div>
  );
}
