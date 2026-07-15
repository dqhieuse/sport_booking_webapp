import { ChevronRight } from "@gravity-ui/icons";
import {
  Button,
  Card,
  InputOTP,
  Link,
  Separator,
  Typography,
  REGEXP_ONLY_DIGITS,
} from "@heroui/react";

import { routePaths } from "~/routes/routePaths";

export default function VerifyEmailPage() {
  return (
    <section className="flex min-h-screen justify-center overflow-y-auto bg-white px-5 py-8 sm:px-12 lg:rounded-[24px]">
      <div className="flex min-h-[calc(100vh-64px)] w-full max-w-[1184px] flex-col items-center justify-center">
        <Card
          className="flex w-full max-w-[550px] flex-1 justify-center border-0 bg-white shadow-none"
          variant="transparent"
        >
          <Card.Content className="flex w-full flex-col justify-center">
            <header className="mb-4 space-y-2">
              <Typography.Heading
                className="text-[24px] font-bold leading-[31px] text-[#111111]"
                level={1}
              >
                Xác minh Email
              </Typography.Heading>
              <Typography.Paragraph
                className="text-[14px] leading-[18px] text-[#696969]"
                size="sm"
              >
                Vui lòng nhập OTP được gửi trong email n***a@email.com
              </Typography.Paragraph>
            </header>

            <div className="w-full py-2">
              <InputOTP
                className="w-full"
                inputClassName="sr-only"
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTP.Group className="flex items-center gap-2">
                  <InputOTP.Slot
                    className="flex h-10 w-[38px] items-center justify-center rounded-xl bg-default text-center text-[18px] leading-7 text-[#18181b]"
                    index={0}
                  />
                  <InputOTP.Slot
                    className="flex h-10 w-[38px] items-center justify-center rounded-xl bg-default text-center text-[18px] leading-7 text-[#18181b]"
                    index={1}
                  />
                  <InputOTP.Slot
                    className="flex h-10 w-[38px] items-center justify-center rounded-xl bg-default text-center text-[18px] leading-7 text-[#18181b]"
                    index={2}
                  />
                  </InputOTP.Group>
                  <InputOTP.Separator />
                  <InputOTP.Group>
                  <InputOTP.Slot
                    className="flex h-10 w-[38px] items-center justify-center rounded-xl bg-default text-center text-[18px] leading-7 text-[#18181b]"
                    index={3}
                  />
                  <InputOTP.Slot
                    className="flex h-10 w-[38px] items-center justify-center rounded-xl bg-default text-center text-[18px] leading-7 text-[#18181b]"
                    index={4}
                  />
                  <InputOTP.Slot
                    className="flex h-10 w-[38px] items-center justify-center rounded-xl bg-default text-center text-[18px] leading-7 text-[#18181b]"
                    index={5}
                  />
                </InputOTP.Group>
              </InputOTP>

              <Typography.Paragraph
                className="mt-2 flex gap-1 text-[14px] leading-5 text-muted"
                size="sm"
              >
                Không nhận được mã?
                <Link className="font-medium text-[#18181b] hover:underline!">
                  Gửi lại
                </Link>
              </Typography.Paragraph>
            </div>

            <Button
              className="mt-2 h-11 w-full rounded-3xl text-[14px]! font-medium!"
              type="submit"
              variant="primary"
            >
              Tiếp tục
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
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
