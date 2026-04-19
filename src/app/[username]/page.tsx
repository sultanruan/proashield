export default function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          @{params.username}
        </h1>
        <p className="mt-2 text-gray-500">Public screening page — Coming in Week 3</p>
      </div>
    </main>
  )
}
