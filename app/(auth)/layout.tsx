import Logo from "@/components/Logo";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="auth-layout">
    <section className="auth-left-section scrollbar-hide-default">
      <Link href="/" className="auth-logo max-w-max">
        <Logo className="w-auto h-8" />
      </Link>

      <div className="flex-1 pb-6 lg:pb-8">{children}</div>
    </section>

    <section className="auth-right-section">
      <div className="lg:mt-4 lg:mb-16 relative z-10">
        <blockquote className="auth-blockquote">
          PepTickr turned my watchlist into a winning list. The alerts are
          spot-on, and I feel more confident making moves in the market.
        </blockquote>

        <div className="flex justify-between items-center">
          <div>
            <cite className="auth-testimonial-author">&mdash; Ethan R.</cite>
            <p className="text-gray-500 max-md:text-xs">Retail Investor</p>
          </div>

          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((item) => (
              <StarIcon
                key={item}
                size={20}
                strokeWidth="0"
                className="fill-yellow-400"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Image
          src="/images/full-dashboard.png"
          alt="Dashboard preview image"
          width={1440}
          height={1150}
          className="auth-dashboard-preview absolute top-0"
        />
      </div>
    </section>
  </div>
);

export default AuthLayout;
