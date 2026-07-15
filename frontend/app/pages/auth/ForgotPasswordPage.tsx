import { ChevronRight } from "@gravity-ui/icons";
import {
  Button,
  Card,
  Form,
  InputGroup,
  Label,
  Link,
  TextField,
  Typography,
} from "@heroui/react";

import { routePaths } from "~/routes/routePaths";

export default function ForgotPasswordPage() {
  return (
    <section className="flex min-h-screen justify-center overflow-y-auto bg-white px-5 py-8 sm:px-12 lg:rounded-[24px]">
      <div className="flex min-h-[calc(100vh-64px)] w-full max-w-[1184px] flex-col items-center justify-center">
        <Card
          className="flex w-full max-w-[550px] flex-1 justify-center border-0 bg-white shadow-none"
          variant="transparent"
        >
          <Card.Content className="flex w-full flex-col justify-center">
            <header className="mb-4">
              <Typography.Heading
                className="text-[24px] font-bold leading-[31px] text-[#111111]"
                level={1}
              >
                Quên mật khẩu
              </Typography.Heading>
            </header>

            <Form className="w-full gap-0 py-2">
              <TextField className="w-full pb-2" name="email">
                <Label>Email</Label>
                <InputGroup className="rounded-2xl bg-default shadow-none">
                  <InputGroup.Input
                    className="h-11 w-full rounded-2xl border-0 bg-default px-3 text-[14px] text-[#18181b] shadow-none outline-none placeholder:text-muted"
                    id="email"
                    placeholder="nguyenvana@gmail.com"
                    type="email"
                  />
                </InputGroup>
              </TextField>

              <Typography.Paragraph
                className="w-full pb-3 text-[14px] leading-5 text-muted"
                size="sm"
              >
                Đường dẫn khôi phục mật khẩu sẽ được gửi vào email được đăng ký
                cho tài khoản của bạn.
              </Typography.Paragraph>

              <Button
                className="h-11 w-full rounded-3xl text-[14px]! font-medium!"
                type="submit"
                variant="primary"
              >
                Tiếp tục
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </Form>
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
