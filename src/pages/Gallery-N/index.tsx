import Layout from '@/components/Layout'

export default function GalleryPage() {
  return (
    <Layout>
      <div className="mb-auto mt-auto flex w-full space-x-4 overflow-y-auto flex-col">
        <div className="w-full mt-20 flex justify-center ">
          <div className="text-center w-80 bg-white mb-10">语言选择器</div>
        </div>
        <div className="flex items-start justify-center w-full mt-5 overflow-y-auto">
          <div className=" overflow-y-auto h-full max-h-full">
            <div className="customized-scrollbar overflow-y-auto mr-4">
              <div className="w-full bg-gray-300 text-center mt-10">词典标签</div>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
                  <div key={item} className="h-40 w-80 bg-gray-500">
                    词典{item}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-300 text-center mt-10">词典标签</div>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
                  <div key={item} className="h-40 w-40 bg-gray-500">
                    词典{item}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-300 text-center mt-10">词典标签</div>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
                  <div key={item} className="h-40 w-40 bg-gray-500">
                    词典{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-40 text-center bg-gray-400 mt-20 w-40 h-40 bg-red-300">导航</div>
        </div>
      </div>
    </Layout>
  )
}
