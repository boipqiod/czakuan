export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        에대숲 - 에버랜드 커뮤니티
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">최근 게시글</h2>
          <p className="text-gray-600">
            곧 게시글 목록이 여기에 표시됩니다.
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500">
            React + Vite + NestJS 모노레포 마이그레이션이 진행 중입니다.
          </p>
        </div>
      </div>
    </div>
  )
}