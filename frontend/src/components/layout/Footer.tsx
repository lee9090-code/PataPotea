export default function Footer() {
  return (
    <footer className="bg-navy text-white px-6 py-8 mt-auto">
      <div className="max-w-6xl mx-auto flex justify-between items-start">
        <div>
          <div className="font-bold text-lg">patapotea</div>
          <div className="text-sm text-gray-400 mt-1">A little less lost. A little more connected.</div>
        </div>
        <div className="text-sm text-gray-400 text-right">
          <div>Strathmore University / Nairobi, Kenya</div>
          <div className="mt-2 flex gap-4">
            <a href="/privacy" className="hover:text-white">Privacy policy</a>
            <a href="/help" className="hover:text-white">Get help</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
