import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function useAuth() {
  const { loggedInUserWaId, setLoggedInUserWaId } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-auth`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data?.wa_id) {
          setLoggedInUserWaId(res.data.wa_id);
        } else {
          router.push("/signin");
        }
      } catch (err) {
        router.push("/signin");
      }
    };

    fetchUser();
  }, [setLoggedInUserWaId, router]);

  return loggedInUserWaId;
}
