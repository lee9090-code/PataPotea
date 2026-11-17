
export default function Footer() {
  return (
    <footer className="bg-navy text-white px-6 py-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start gap-6">
        {/* Branding */}
        <div>
          <div className="font-bold text-lg">patapotea</div>

          <p className="text-sm text-gray-400 mt-1">
            A little less lost. A little more connected.
          </p>
        </div>

        {/* University and footer links */}
        <div className="text-sm text-gray-400 sm:text-right">
          <p>Strathmore University / Nairobi, Kenya</p>

          <div className="mt-2 flex gap-4 sm:justify-end">
            <span
              title="Privacy policy page is not yet available."
              className="cursor-default"
            >
              Privacy policy
            </span>

            <span
              title="Help page is not yet available."
              className="cursor-default"
            >
              Get help
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
