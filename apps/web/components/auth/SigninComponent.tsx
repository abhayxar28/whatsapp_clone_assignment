"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function SigninComponent() {
  const [country, setCountry] = useState("1");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullPhone = `${country}${phone}`;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login-user`, {
        wa_id: fullPhone
      });

      const data = await res.data;
      localStorage.setItem('token', data.token)
      router.push('/')
      toast.success("Signin Successfull")
      
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
      setPhone("");
      setCountry("");
      toast.error("Signin unsuccessfull")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
      <Card className="w-[360px] rounded-xl shadow-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#25D366"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9c0 2.39-.94 4.57-2.47 6.13a8.96 8.96 0 0 1-6.53 2.87c-1.63 0-3.17-.39-4.5-1.07L3 21l1.07-4.5A8.96 8.96 0 0 1 3 12z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">WhatsApp</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verify your phone number to start messaging
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex gap-2">
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-[100px] cursor-pointer">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">US +1</SelectItem>
                    <SelectItem value="91">IN +91</SelectItem>
                    <SelectItem value="81">JP +81</SelectItem>
                    <SelectItem value="44">UK +44</SelectItem>
                    <SelectItem value="61">AU +61</SelectItem>
                    <SelectItem value="64">NZ +64</SelectItem>
                    <SelectItem value="65">SG +65</SelectItem>
                    <SelectItem value="971">AE +971</SelectItem>
                    <SelectItem value="49">DE +49</SelectItem>
                    <SelectItem value="33">FR +33</SelectItem>
                    <SelectItem value="39">IT +39</SelectItem>
                    <SelectItem value="92">PK +92</SelectItem>
                    <SelectItem value="34">ES +34</SelectItem>
                    <SelectItem value="86">CN +86</SelectItem>
                    <SelectItem value="852">HK +852</SelectItem>
                    <SelectItem value="82">KR +82</SelectItem>
                    <SelectItem value="55">BR +55</SelectItem>
                    <SelectItem value="27">ZA +27</SelectItem>
                    <SelectItem value="7">RU +7</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#1ebc59]"
              disabled={loading}
            >
              {loading ? "Sending..." : "Next"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex justify-center">
          <Link href="/signup" className="text-green-600 text-sm hover:underline">
            Create new account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
