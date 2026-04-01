import { Button } from "@/components/ui/button";

export default function CommunityVote() {
  return (
    <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[1px] rounded-xl inline-block">
      <div className="bg-[#010101] rounded-xl p-2">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="font-bold text-[24px] text-white">
            Community Vote
          </h1>
          <span className="text-[#858CA2] text-[11px]">4.3M votes</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#FFFFFF]/10 rounded-full overflow-hidden mb-4">
          <div className="flex h-full">
            <div
              className="bg-[#62BA01] h-full"
              style={{ width: "70%" }}
            ></div>
            <div
              className="bg-[#F04866] h-full"
              style={{ width: "30%" }}
            ></div>
          </div>
        </div>

        {/* Voting Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-[#62BA01]/10 hover:bg-[#62BA01]/20 rounded-lg py-2 px-4 transition-colors">
            <span className="text-[#62BA01] font-medium">
              Upvote (70%)
            </span>
          </Button>
          <Button className="flex-1 bg-[#F04866]/10 hover:bg-[#F04866]/20 rounded-lg py-2 px-4 transition-colors">
            <span className="text-[#F04866] font-medium">
              Downvote (30%)
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

