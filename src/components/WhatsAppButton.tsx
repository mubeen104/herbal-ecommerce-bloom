import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  return (
    <Button
      asChild
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
    >
      <a
        href="https://wa.me/c/923043073838"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </a>
    </Button>
  );
};

export default WhatsAppButton;