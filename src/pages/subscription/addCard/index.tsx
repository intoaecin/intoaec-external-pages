import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { loadStripe } from "@stripe/stripe-js";
import { useEnv } from "@/features/hooks/useEnv";
import { decryptAES } from "@/lib/helpers";
import { AddPaymentCardWrapper } from "@/features/subscription/AddPaymentCard";

export default function AddCardPage() {
  const router = useRouter();
  const { NEXT_PUBLIC_ACCESS_KEY, NEXT_PUBLIC_STRIPE_PUBLISH_KEY } = useEnv();
  const [clientInformation, setClientInformation] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [stripe, setStripe] = useState<any>(null);

  useEffect(() => {
    if (router.isReady && router.query.token && NEXT_PUBLIC_ACCESS_KEY) {
      setLoading(true);
      decryptToken(router.query.token as string).finally(() => {
        setLoading(false);
      });
    }
  }, [router.isReady, router.query.token, NEXT_PUBLIC_ACCESS_KEY]);

  const decryptToken = async (tokenStr: string) => {
    try {
      const decrypted = await decryptAES(tokenStr, NEXT_PUBLIC_ACCESS_KEY);
      if (decrypted) {
        const payload = JSON.parse(decrypted);
        setClientInformation(payload);

        if (payload?.publishKey) {
          const stripeInstance = await loadStripe(payload.publishKey);
          setStripe(stripeInstance);
        } else {
          const stripeInstance = await loadStripe(NEXT_PUBLIC_STRIPE_PUBLISH_KEY);
          setStripe(stripeInstance);
        }
      }
    } catch (err) {
      console.error("Error decrypting add card token:", err);
    }
  };

  return (
    <main>
      <AddPaymentCardWrapper
        stripePromise={stripe}
        isClient={!!clientInformation?.isClient}
        clientInformation={clientInformation}
        loading={loading}
      />
    </main>
  );
}
