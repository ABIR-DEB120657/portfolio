document.addEventListener("DOMContentLoaded", () => {
    // HTML থেকে intro overlay এবং মেইন পোর্টফোলিও কন্টেন্ট সিলেক্ট করা
    const introOverlay = document.getElementById("intro-overlay");
    const mainPortfolio = document.getElementById("main-portfolio-content");

    // sessionStorage চেক করা: ইউজার কি আগেই এই সেশনে সাইটে ঢুকেছে?
    const hasIntroPlayed = sessionStorage.getItem("introPlayed");

    if (hasIntroPlayed === "true") {
        // যদি আগেই দেখে থাকে, তাহলে ইন্ট্রো হাইড করে সরাসরি সাইট দেখাবো
        if (introOverlay) {
            introOverlay.style.display = "none";
        }
        if (mainPortfolio) {
            mainPortfolio.style.opacity = "1";
            mainPortfolio.style.visibility = "visible";
        }
        // ইন্ট্রো না দেখালেও hero name scramble একবার চালাবো
        runHeroNameScramble();
    } else {
        // যদি ফার্স্ট টাইম হয়, তাহলে মেইন কন্টেন্ট হাইড রেখে ইন্ট্রো দেখাবো
        if (mainPortfolio) {
            mainPortfolio.style.opacity = "0";
            mainPortfolio.style.visibility = "hidden";
        }

        // ১০ সেকেন্ড (10000ms) পর ইন্ট্রো ফেইড আউট শুরু হবে
        setTimeout(() => {
            if (introOverlay) {
                introOverlay.style.transition = "opacity 1s ease-in-out, transform 1s ease-in-out";
                introOverlay.style.opacity = "0";
                introOverlay.style.transform = "translateY(-20px)"; // একটু উপরের দিকে ফেইড হয়ে যাবে

                // ফেইড আউট হওয়ার জন্য ১ সেকেন্ড (1000ms) অপেক্ষা করে ইন্ট্রো সরিয়ে মেইন সাইট আনবো
                setTimeout(() => {
                    introOverlay.style.display = "none";

                    if (mainPortfolio) {
                        mainPortfolio.style.transition = "opacity 1.5s ease-in-out";
                        mainPortfolio.style.visibility = "visible";
                        mainPortfolio.style.opacity = "1";
                    }

                    // sessionStorage-এ ডেটা সেভ করা, যাতে রিফ্রেশ দিলে আর না দেখায়
                    sessionStorage.setItem("introPlayed", "true");

                    // মেইন সাইট দেখানোর সাথে সাথে hero name scramble শুরু
                    runHeroNameScramble();
                }, 1000);
            }
        }, 10000); // ঠিক ১০ সেকেন্ড পর এই লজিক ফায়ার হবে
    }
});

/* ════════════════════════════════════════════════════════
   TEXT SCRAMBLE — "Abir Deb"
   .hero-name এর টেক্সট প্রথমে random character দিয়ে scramble
   হবে (matrix style), তারপর ১.২ সেকেন্ডে আসল টেক্সটে resolve
   হবে।
   ════════════════════════════════════════════════════════ */
function runHeroNameScramble() {
    const el = document.querySelector(".hero-name");
    if (!el) return;

    const finalText = el.textContent.trim();
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!<>-_\\/[]{}—=+*^?#";
    const duration = 1200; // মোট সময় (ms)
    const frameRate = 30;  // প্রতি সেকেন্ডে ফ্রেম
    const totalFrames = Math.round((duration / 1000) * frameRate);

    let frame = 0;

    // letter-by-letter resolve করার জন্য reveal threshold
    function getRevealCount(currentFrame) {
        return Math.floor((currentFrame / totalFrames) * finalText.length);
    }

    const interval = setInterval(() => {
        frame++;
        const revealCount = getRevealCount(frame);

        let output = "";
        for (let i = 0; i < finalText.length; i++) {
            const targetChar = finalText[i];

            if (targetChar === " ") {
                output += " ";
                continue;
            }

            if (i < revealCount) {
                output += targetChar;
            } else {
                output += chars[Math.floor(Math.random() * chars.length)];
            }
        }

        el.textContent = output;

        if (frame >= totalFrames) {
            clearInterval(interval);
            el.textContent = finalText; // নিশ্চিত করে আসল টেক্সট সেট করা
        }
    }, 1000 / frameRate);
}