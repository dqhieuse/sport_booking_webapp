import {
  ArrowsRotateRight,
  Check,
  CircleCheck,
  CircleXmark,
} from "@gravity-ui/icons";
import { Button, Card, Link, Typography } from "@heroui/react";
import { useNavigate } from "react-router";

import { routePaths } from "~/routes/routePaths";

type VerifyEmailStatusPageProps = {
  status: "success" | "failed";
};

const statusContent = {
  success: {
    title: "Xác minh email thành công",
    description:
      "Đã kích hoạt thành công tài khoản của bạn. Bắt đầu đặt sân thể thao phù hợp và trải nghiệm những hoạt động thú vị.",
    actionLabel: "Hoàn thành",
    actionTo: routePaths.home,
    buttonClassName: "bg-primary text-primary-foreground",
    icon: <CircleCheck className="size-20 text-success" aria-hidden="true" />,
    actionIcon: <Check className="size-4" aria-hidden="true" />,
  },
  failed: {
    title: "Xác minh email thất bại",
    description: "OTP không hợp lệ, vui lòng thử lại hoặc kiểm tra email của bạn.",
    actionLabel: "Thử lại",
    actionTo: routePaths.verifyEmail,
    buttonClassName: "bg-[#18181b] text-primary-foreground",
    icon: <CircleXmark className="size-20 text-danger" aria-hidden="true" />,
    actionIcon: <ArrowsRotateRight className="size-4" aria-hidden="true" />,
  },
} as const;

export default function VerifyEmailStatusPage({
  status,
}: VerifyEmailStatusPageProps) {
  const navigate = useNavigate();
  const content = statusContent[status];

  return (
    <section className="flex min-h-screen justify-center overflow-y-auto bg-white px-5 py-8 sm:px-12 lg:rounded-[24px]">
      <div className="flex min-h-[calc(100vh-64px)] w-full max-w-[1184px] flex-col items-center justify-center">
        <Card
          className="flex w-full max-w-[550px] flex-1 justify-center border-0 bg-white shadow-none"
          variant="transparent"
        >
          <Card.Content className="flex w-full flex-col justify-center">
            <div className="flex w-full flex-col items-center py-2">
              <div className="flex flex-col items-center gap-2.5 py-2.5">
                {content.icon}
              </div>

              <div className="flex w-full flex-col items-center gap-2.5 px-2.5 py-2.5 text-center">
                <Typography.Heading
                  className="text-center text-[24px] font-bold leading-[31px] text-[#111111]"
                  level={1}
                >
                  {content.title}
                </Typography.Heading>
                <Typography.Paragraph
                  className="max-w-[550px] text-center text-[15px] leading-5 text-[#696969]"
                  size="sm"
                >
                  {content.description}
                </Typography.Paragraph>
              </div>

              <Button
                className={`mt-2 h-11 w-full rounded-3xl text-[14px]! font-medium! ${content.buttonClassName}`}
                type="button"
                variant="primary"
                onPress={() => navigate(content.actionTo)}
              >
                {content.actionLabel}
                {content.actionIcon}
              </Button>
            </div>
          </Card.Content>
        </Card>

        <Link
          className="mx-auto mt-8 rounded-full border border-transparent px-4 py-2 font-bold text-[#111111] transition-all! hover:border-secondary"
          href={routePaths.home}
        >
          SportZone<span className="text-success">.</span>
        </Link>
      </div>
    </section>
  );
}
