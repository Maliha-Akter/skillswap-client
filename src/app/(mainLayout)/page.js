import Banner from "@/components/Banner";
import FeaturedTasks from "@/components/FeaturedTasks";

import Image from "next/image";

export default function Home() {
  return (
    <div className=" bg-zinc-50 font-sans dark:bg-black">
      <Banner></Banner>
      <FeaturedTasks></FeaturedTasks>
    </div>
  );
}
