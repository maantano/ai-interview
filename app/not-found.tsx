import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link 
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}