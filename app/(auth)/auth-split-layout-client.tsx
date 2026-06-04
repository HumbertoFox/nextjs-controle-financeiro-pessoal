'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AppLogoIconSvg from '@/_components/app-logo-icon-svg';
import { Plus } from 'lucide-react';
import AppLogoIconSvgVercel from '@/_components/app-logo-icon-svg-vercel';
import Image from 'next/image';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'NextJs + Shadcn + Neon';

export default function AuthSplitLayoutClient() {
    const logoNextRef = useRef<HTMLDivElement>(null);
    const logoPlusOneRef = useRef<HTMLDivElement>(null);
    const logoVercelRef = useRef<HTMLDivElement>(null);
    const logoPlusTwoRef = useRef<HTMLDivElement>(null);
    const logoNeonRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!logoNextRef.current || !logoVercelRef.current || !logoPlusOneRef.current || !logoPlusTwoRef.current || !logoNeonRef.current) return;
        const tl = gsap.timeline();

        tl.fromTo(
            logoVercelRef.current,
            { x: -500, opacity: 0, scale: 0.8 },
            { x: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
        )
            .fromTo(
                logoNextRef.current,
                { x: -500, opacity: 0, scale: 0.8 },
                { x: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
                "+=0.3"
            )
            .fromTo(
                logoNeonRef.current,
                { x: -500, opacity: 0, scale: 0.8 },
                { x: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
                "+=0.3"
            )
            .to(
                logoNextRef.current,
                { scale: 1.2, duration: 0.2, ease: "power1.inOut", yoyo: true, repeat: 3 }
            )
            .to(
                logoVercelRef.current,
                { scale: 1.2, duration: 0.2, ease: "power1.inOut", yoyo: true, repeat: 3 }
            )
            .to(
                logoNeonRef.current,
                { scale: 1.2, duration: 0.2, ease: "power1.inOut", yoyo: true, repeat: 3 }
            )
            .fromTo(
                logoPlusOneRef.current,
                { opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
            )
            .fromTo(
                logoPlusTwoRef.current,
                { opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
            );
    }, []);
    return (
        <div className="min-w-1/2 h-dvh fixed hidden flex-col items-center justify-center px-8 sm:px-0 2xl:max-w-none 2xl:px-0 2xl:block">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="flex">
                    <Link href="/" className="relative z-20 flex items-center text-lg font-medium">
                        <AppLogoIconSvg className="mr-2 size-8 fill-current" />
                        {APP_NAME}
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-6 h-full z-10">
                    <div
                        ref={logoNextRef}
                        className="opacity-0"
                    >
                        <AppLogoIconSvg className="size-50 fill-white rounded-full" />
                    </div>
                    <div
                        ref={logoPlusOneRef}
                        className="opacity-0"
                    >
                        <Plus className="size-16" />
                    </div>
                    <div
                        ref={logoVercelRef}
                        className="opacity-0"
                    >
                        <AppLogoIconSvgVercel className="size-50 fill-white" />
                    </div>
                    <div
                        ref={logoPlusTwoRef}
                        className="opacity-0"
                    >
                        <Plus className="size-16" />
                    </div>
                    <div
                        ref={logoNeonRef}
                        className="opacity-0"
                    >
                        <Image
                            src="/neon-logomark-dark.svg"
                            alt="Neon Logo"
                            width={500}
                            height={500}
                            className="size-40 fill-white"
                        />
                    </div>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">&ldquo;{APP_NAME} = Starter kit&rdquo;</p>
                        <footer className="text-sm text-neutral-300">Seu sistema de autenticação Next.js com Vercel.</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}