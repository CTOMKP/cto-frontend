export default function LoadingSkeleton() {
  return (
    <main>
      <div className="px-[100px] border-b border-b-[#8686864D]">
        <div className='mt-6.5 bg-[url("/project-profile/default-project-bg-img.png")] bg-cover bg-center bg-no-repeat h-[167px] rounded-t-lg'></div>
        <div className="size-[80px] ml-2 -mt-10 rounded-full bg-gray-600 animate-pulse"></div>
        <div className="mt-6.5">
          <div className="flex justify-between">
            <div className="h-8 w-32 bg-gray-600 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-48 bg-gray-600 rounded animate-pulse mt-2"></div>
          <div className="h-4 w-96 bg-gray-600 rounded animate-pulse mt-4"></div>
        </div>
      </div>
      <div className="px-[100px] mt-4">
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] w-full p-[1px] rounded-xl inline-block">
          <div className="bg-[#010101] rounded-xl p-2">
            <div className="grid grid-cols-5 gap-[5px]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[113px] bg-gray-600 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

