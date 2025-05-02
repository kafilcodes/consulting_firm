"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/auth-slice";
import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );

        // Redirect to client page if on auth pages
        if (pathname === "/auth/signin" || pathname === "/auth/signup" || pathname === "/") {
          router.push("/client");
        }
      } else {
        // User is signed out
        dispatch(clearUser());
        
        // Redirect to signin if on protected routes
        if (pathname.startsWith('/client') || pathname.startsWith('/admin')) {
          router.push("/auth/signin");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch, router, pathname]);

  return (
    <>
      {!loading && children}
    </>
  );
} 