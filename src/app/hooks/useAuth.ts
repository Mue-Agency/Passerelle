"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/app/services/users.service";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  interests: string[];
};

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // L'identité vient du cookie de session httpOnly (via getMe). Le proxy garde déjà
    // la route ; un 401 éventuel est traité dans request() (logout + redirection).
    usersService.getMe().then((result) => {
      if (result.isOk) {
        setUser(result.data.user);
        setIsReady(true);
      } else {
        router.replace("/");
      }
    });
  }, [router]);

  return { user, isReady };
}
