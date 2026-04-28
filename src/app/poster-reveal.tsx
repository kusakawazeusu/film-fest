"use client";

import { Noto_Sans_TC, Oswald } from "next/font/google";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState, type MouseEvent } from "react";

type PosterMovie = {
  id: number;
  movieUrl: string;
  posterUrl: string;
  title: string;
};

type PosterLayout = {
  delay: number;
  left: string;
  top: string;
  width: string;
};

const FIVE_POSTER_MEDIUM = "clamp(156px, 22vw, 208px)";
const FIVE_POSTER_LARGE = "clamp(220px, 30vw, 270px)";
const FIVE_POSTER_GAP = "clamp(18px, 2.8vw, 34px)";
const posterTitleFont = Oswald({
  subsets: ["latin"],
  weight: ["400", "500"],
});
const festivalTitleFont = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["500", "700"],
});

function withDelays(layouts: Omit<PosterLayout, "delay">[]): PosterLayout[] {
  return layouts.map((layout, index) => ({
    ...layout,
    delay: index * 0.14,
  }));
}

function PosterCard({
  entranceDelay,
  index,
  layout,
  mouseX,
  mouseY,
  poster,
  revealPhase,
  showTitle,
  isInteractive,
}: {
  entranceDelay: number;
  index: number;
  layout: PosterLayout;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  poster: PosterMovie;
  revealPhase: "blurred" | "clear";
  showTitle: boolean;
  isInteractive: boolean;
}) {
  const depth = 1 - index * 0.08;
  const hoverRotateY = useTransform(mouseX, (value) => value * 4 * depth);
  const hoverRotateX = useTransform(mouseY, (value) => value * -3 * depth);
  const hoverX = useTransform(mouseX, (value) => value * 10 * depth);
  const hoverY = useTransform(mouseY, (value) => value * 8 * depth);

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none poster-stack"
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        zIndex: index + 1,
        x: hoverX,
        y: hoverY,
        rotateX: hoverRotateX,
        rotateY: hoverRotateY,
      }}
      initial={{
        opacity: 0,
        scale: 0.84,
        rotate: 0,
        rotateX: 14,
        rotateY: index % 2 === 0 ? -8 : 8,
        z: -80,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        rotateX: 0,
        rotateY: 0,
        z: 0,
      }}
      transition={{
        duration: revealPhase === "clear" ? 1.25 : 1.8,
        delay: layout.delay + entranceDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <a
        href={poster.movieUrl}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!isInteractive}
        tabIndex={isInteractive ? 0 : -1}
        className={`block ${
          isInteractive
            ? "pointer-events-auto cursor-pointer"
            : "pointer-events-none cursor-default"
        }`}
        onClick={(event) => {
          if (!isInteractive) {
            event.preventDefault();
            return;
          }

          event.stopPropagation();
        }}
      >
        <div
          className={`overflow-hidden rounded-[1rem] border bg-black/35 shadow-[0_26px_90px_rgba(0,0,0,0.42)] backdrop-blur-sm transition-colors duration-300 ${
            isInteractive
              ? "border-white/20 hover:border-amber-200/55"
              : "border-white/20"
          }`}
        >
          <motion.div
            initial={{ filter: "blur(22px)" }}
            animate={{
              filter: revealPhase === "clear" ? "blur(0px)" : "blur(18px)",
            }}
            transition={{
              duration: revealPhase === "clear" ? 1.25 : 1.8,
              delay: layout.delay + entranceDelay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={poster.posterUrl}
              alt={poster.title}
              width={780}
              height={1170}
              priority={index === 0}
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 30vw, 18vw"
              className="h-auto w-full object-cover"
            />
          </motion.div>
        </div>
      </a>
      <motion.div
        className="top-[calc(100%+0.95rem)] left-1/2 absolute px-2 w-max max-w-[min(24rem,92vw)] text-stone-100 text-center -translate-x-1/2"
        initial={false}
        animate={{
          opacity: showTitle ? 1 : 0,
          y: showTitle ? 0 : 18,
        }}
        transition={{
          duration: 0.72,
          delay: showTitle ? 1 + index * 0.16 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span
          className={`${posterTitleFont.className} block max-w-[min(18rem,26vw)] text-balance break-words text-[1.2rem] leading-[1.02] tracking-[0.02em] drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] sm:max-w-[min(20rem,24vw)] sm:text-[1.45rem] lg:max-w-[min(22rem,22vw)] lg:text-[1.7rem]`}
        >
          {poster.title}
        </span>
      </motion.div>
    </motion.div>
  );
}

function FestivalHeading({
  festivalTitle,
  mouseX,
  mouseY,
  visible,
}: {
  festivalTitle: string;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  visible: boolean;
}) {
  const headingX = useTransform(mouseX, (value) => value * 12);
  const headingY = useTransform(mouseY, (value) => value * 10);
  const headingRotateX = useTransform(mouseY, (value) => value * -1.8);
  const headingRotateY = useTransform(mouseX, (value) => value * 1.8);

  return (
    <motion.div
      className="top-1/2 z-30 absolute inset-x-6 -translate-y-1/2 pointer-events-none"
      initial={{ opacity: 0, scale: 0.965 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.985,
      }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        style={{
          x: headingX,
          y: headingY,
          rotateX: headingRotateX,
          rotateY: headingRotateY,
        }}
        initial={{ y: 22 }}
        animate={{ y: visible ? 0 : -22 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className={`${festivalTitleFont.className} mx-auto max-w-5xl text-balance text-center text-[clamp(3.2rem,11vw,8.5rem)] leading-[0.92] tracking-[0.06em] text-stone-50 drop-shadow-[0_16px_40px_rgba(0,0,0,0.5)] underline underline-offset-30`}
        >
          {`影展：${festivalTitle}`}
        </h1>
      </motion.div>
    </motion.div>
  );
}

function getPosterLayouts(count: number): PosterLayout[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return withDelays([
      {
        left: "50%",
        top: "50%",
        width: "min(42vw, 360px)",
      },
    ]);
  }

  if (count === 2) {
    return withDelays([
      {
        left: "32%",
        top: "50%",
        width: "min(32vw, 280px)",
      },
      {
        left: "68%",
        top: "50%",
        width: "min(32vw, 280px)",
      },
    ]);
  }

  if (count === 3) {
    return withDelays([
      {
        left: "50%",
        top: "50%",
        width: "min(34vw, 300px)",
      },
      {
        left: "24%",
        top: "50%",
        width: "min(21vw, 260px)",
      },
      {
        left: "76%",
        top: "50%",
        width: "min(21vw, 260px)",
      },
    ]);
  }

  if (count === 4) {
    return withDelays([
      {
        left: "20%",
        top: "50%",
        width: "min(25vw, 240px)",
      },
      {
        left: "40%",
        top: "50%",
        width: "min(18vw, 220px)",
      },
      {
        left: "60%",
        top: "50%",
        width: "min(25vw, 240px)",
      },
      {
        left: "80%",
        top: "50%",
        width: "min(18vw, 220px)",
      },
    ]);
  }

  if (count === 5) {
    return withDelays([
      {
        left: "50%",
        top: "50%",
        width: FIVE_POSTER_LARGE,
      },
      {
        left: `calc(50% - ((${FIVE_POSTER_LARGE} / 2) + ${FIVE_POSTER_GAP} + (${FIVE_POSTER_MEDIUM} / 2)))`,
        top: "50%",
        width: FIVE_POSTER_MEDIUM,
      },
      {
        left: `calc(50% + ((${FIVE_POSTER_LARGE} / 2) + ${FIVE_POSTER_GAP} + (${FIVE_POSTER_MEDIUM} / 2)))`,
        top: "50%",
        width: FIVE_POSTER_MEDIUM,
      },
      {
        left: `calc(50% - ((${FIVE_POSTER_LARGE} / 2) + ${FIVE_POSTER_MEDIUM} + (${FIVE_POSTER_MEDIUM} / 2) + (${FIVE_POSTER_GAP} * 2)))`,
        top: "50%",
        width: FIVE_POSTER_MEDIUM,
      },
      {
        left: `calc(50% + ((${FIVE_POSTER_LARGE} / 2) + ${FIVE_POSTER_MEDIUM} + (${FIVE_POSTER_MEDIUM} / 2) + (${FIVE_POSTER_GAP} * 2)))`,
        top: "50%",
        width: FIVE_POSTER_MEDIUM,
      },
    ]);
  }

  const columns = count === 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4;
  const rows = Math.ceil(count / columns);

  return withDelays(
    Array.from({ length: count }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const left = ((column + 0.5) / columns) * 100;
      const top = ((row + 0.5) / rows) * 100;

      const width =
        columns === 1
          ? "min(38vw, 320px)"
          : columns === 2
            ? "min(30vw, 260px)"
            : columns === 3
              ? "min(24vw, 220px)"
              : "min(18vw, 180px)";

      return {
        left: `${left}%`,
        top: `${top}%`,
        width,
      };
    }),
  );
}

export default function PosterReveal({
  festivalTitle,
  posters,
}: {
  festivalTitle: string;
  posters: PosterMovie[];
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springMouseX = useSpring(mouseX, {
    stiffness: 80,
    damping: 22,
    mass: 0.6,
  });
  const springMouseY = useSpring(mouseY, {
    stiffness: 80,
    damping: 22,
    mass: 0.6,
  });
  const layouts = getPosterLayouts(posters.length);
  const showFestivalTitle = !hasStarted;
  const postersFullyRevealed = posters.length > 0 && revealedCount >= posters.length;
  const showTitles = postersFullyRevealed;

  useEffect(() => {
    const preloadedImages = posters.map((poster) => {
      const image = new window.Image();

      image.src = poster.posterUrl;

      return image;
    });

    return () => {
      preloadedImages.forEach((image) => {
        image.src = "";
      });
    };
  }, [posters]);

  const handleReveal = () => {
    if (!hasStarted) {
      setHasStarted(true);
      return;
    }

    setRevealedCount((count) => Math.min(count + 1, posters.length));
  };

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const nextX = (event.clientX / window.innerWidth - 0.5) * 2;
    const nextY = (event.clientY / window.innerHeight - 0.5) * 2;

    mouseX.set(nextX);
    mouseY.set(nextY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.main
      className="relative flex justify-center items-center bg-[#090909] selection:bg-amber-300/30 px-6 py-10 min-h-screen overflow-hidden selection:text-white cursor-pointer"
      onClick={handleReveal}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleReveal();
        }
      }}
      aria-label="Reveal movie posters"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0.72 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover pointer-events-none"
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.26),rgba(0,0,0,0.38)_36%,rgba(0,0,0,0.62)_100%)] pointer-events-none"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,246,214,0.14),_transparent_36%)] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.15, ease: "easeOut" }}
      />
      <motion.div
        className="top-1/2 left-1/2 absolute bg-black/18 blur-3xl rounded-full w-[60vmax] h-[60vmax] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      />
      <FestivalHeading
        festivalTitle={festivalTitle}
        mouseX={springMouseX}
        mouseY={springMouseY}
        visible={showFestivalTitle}
      />

      {hasStarted &&
        posters.map((poster, index) => {
        const layout = layouts[index];

        if (!layout) {
          return null;
        }

        const revealPhase = revealedCount > index ? "clear" : "blurred";

        return (
          <PosterCard
            key={poster.id}
            entranceDelay={revealedCount === 0 ? 0.68 : 0}
            index={index}
            layout={layout}
            mouseX={springMouseX}
            mouseY={springMouseY}
            poster={poster}
            revealPhase={revealPhase}
            isInteractive={postersFullyRevealed}
            showTitle={showTitles}
          />
        );
      })}
    </motion.main>
  );
}
