import { useState } from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import {
    Bold,
    CalendarDays,
    CircleHelp,
    Home,
    Inbox,
    Italic,
    MapPin,
    Search,
    Settings,
    Star,
    Underline,
    User,
} from "@/components/icons";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    ButtonGroup,
    ButtonGroupSeparator,
    ButtonGroupText,
} from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DirectionProvider } from "@/components/ui/direction";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    InputOTP,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar";
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type ComponentPreviewProps = { name: string };

const chartData = [
    { day: "T2", bookings: 8 },
    { day: "T3", bookings: 12 },
    { day: "T4", bookings: 10 },
    { day: "T5", bookings: 18 },
    { day: "T6", bookings: 15 },
];

const chartConfig = {
    bookings: { label: "Booking", color: "var(--primary)" },
} satisfies ChartConfig;

function PreviewFrame({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`mx-auto w-full max-w-md ${className}`}>{children}</div>
    );
}

function CalendarPreview() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="mx-auto rounded-md border"
        />
    );
}

function FormPreview() {
    const form = useForm<{ email: string }>({ defaultValues: { email: "" } });
    return (
        <Form {...form}>
            <form
                className="space-y-4"
                onSubmit={form.handleSubmit(() => undefined)}
            >
                <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Vui lòng nhập email" }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="you@example.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Email dùng để nhận xác nhận booking.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Gửi biểu mẫu</Button>
            </form>
        </Form>
    );
}

function SidebarPreview() {
    return (
        <div className="h-64 overflow-hidden rounded-lg border">
            <SidebarProvider
                className="min-h-0 h-full"
                style={{ "--sidebar-width": "13rem" } as React.CSSProperties}
            >
                <Sidebar collapsible="none" className="border-r">
                    <SidebarHeader>
                        <SidebarInput placeholder="Tìm kiếm..." />
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Ứng dụng</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {[
                                        [Home, "Trang chủ"],
                                        [CalendarDays, "Booking"],
                                        [Settings, "Cài đặt"],
                                    ].map(([Icon, label]) => (
                                        <SidebarMenuItem key={label as string}>
                                            <SidebarMenuButton>
                                                <Icon />
                                                <span>{label as string}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    Nội dung chính
                </div>
            </SidebarProvider>
        </div>
    );
}

export function ComponentPreview({ name }: ComponentPreviewProps) {
    switch (name) {
        case "accordion":
            return (
                <PreviewFrame>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                Quy định đặt sân
                            </AccordionTrigger>
                            <AccordionContent>
                                Đến trước giờ chơi 10 phút để nhận sân.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Chính sách hủy</AccordionTrigger>
                            <AccordionContent>
                                Miễn phí hủy trước 6 tiếng.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </PreviewFrame>
            );
        case "alert":
            return (
                <PreviewFrame>
                    <Alert>
                        <CircleHelp className="text-2xl"/>
                        <AlertTitle>Lưu ý khi đặt sân</AlertTitle>
                        <AlertDescription>
                            Khung giờ được giữ trong 10 phút khi thanh toán.
                        </AlertDescription>
                    </Alert>
                </PreviewFrame>
            );
        case "alert-dialog":
            return (
                <div className="text-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Hủy booking</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Bạn chắc chắn muốn hủy?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Thao tác này không thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Quay lại</AlertDialogCancel>
                                <AlertDialogAction>
                                    Tiếp tục hủy
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        case "aspect-ratio":
            return (
                <PreviewFrame>
                    <AspectRatio
                        ratio={16 / 9}
                        className="overflow-hidden rounded-md bg-muted"
                    >
                        <div className="grid h-full place-items-center bg-gradient-to-br from-primary/15 to-primary/40 text-sm font-medium">
                            16 : 9
                        </div>
                    </AspectRatio>
                </PreviewFrame>
            );
        case "avatar":
            return (
                <div className="flex justify-center">
                    <AvatarGroup>
                        <Avatar>
                            <AvatarFallback>AN</AvatarFallback>
                            <AvatarBadge />
                        </Avatar>
                        <Avatar>
                            <AvatarFallback>BH</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback>CT</AvatarFallback>
                        </Avatar>
                        <AvatarGroupCount>+3</AvatarGroupCount>
                    </AvatarGroup>
                </div>
            );
        case "badge":
            return (
                <div className="flex flex-wrap justify-center gap-2">
                    <Badge>Mặc định</Badge>
                    <Badge variant="secondary">Cầu lông</Badge>
                    <Badge variant="outline">Còn sân</Badge>
                    <Badge variant="destructive">Đã hủy</Badge>
                </div>
            );
        case "breadcrumb":
            return (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#top">
                                Trang chủ
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#top">Sân</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Victory</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            );
        case "button":
            return (
                <div className="flex flex-wrap justify-center gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button size={"sm"}>Small</Button>
                    <Button size={"xs"}>Extra Small</Button>
                    <Button size={"lg"}>Large</Button>
                </div>
            );
        case "button-group":
            return (
                <div className="flex justify-center">
                    <ButtonGroup>
                        <Button variant="outline">Ngày</Button>
                        <Button variant="outline">Tuần</Button>
                        <ButtonGroupSeparator />
                        <ButtonGroupText>2026</ButtonGroupText>
                    </ButtonGroup>
                </div>
            );
        case "calendar":
            return <CalendarPreview />;
        case "card":
            return (
                <PreviewFrame>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sân Victory Cầu Giấy</CardTitle>
                            <CardDescription>
                                Sân cầu lông trong nhà
                            </CardDescription>
                            <CardAction>
                                <Badge>Còn sân</Badge>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">80.000₫ / giờ · 1,2 km</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Xem lịch trống</Button>
                        </CardFooter>
                    </Card>
                </PreviewFrame>
            );
        case "carousel":
            return (
                <PreviewFrame className="px-10">
                    <Carousel>
                        <CarouselContent>
                            {[1, 2, 3].map((item) => (
                                <CarouselItem key={item}>
                                    <div className="grid aspect-video place-items-center rounded-md bg-muted text-2xl font-semibold">
                                        {item}
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </PreviewFrame>
            );
        case "chart":
            return (
                <PreviewFrame>
                    <ChartContainer
                        config={chartConfig}
                        className="h-56 w-full"
                    >
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="bookings"
                                fill="var(--color-bookings)"
                                radius={4}
                            />
                        </BarChart>
                    </ChartContainer>
                </PreviewFrame>
            );
        case "checkbox":
            return (
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox id="preview-checkbox" defaultChecked />
                      <Label htmlFor="preview-checkbox">
                          Nhận thông báo booking
                      </Label>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox id="preview-checkbox-1" defaultChecked />
                      <Label htmlFor="preview-checkbox-1">
                          Nhận thông báo booking
                      </Label>
                    </div>
                </div>
            );
        case "collapsible":
            return (
                <PreviewFrame>
                    <Collapsible>
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-sm font-medium">
                                3 tiện ích đi kèm
                            </span>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    Xem
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="mt-2 rounded-md border p-3 text-sm text-muted-foreground">
                            Phòng thay đồ · Bãi xe · Nước uống
                        </CollapsibleContent>
                    </Collapsible>
                </PreviewFrame>
            );
        case "command":
            return (
                <PreviewFrame>
                    <Command className="rounded-lg border shadow-sm">
                        <CommandInput placeholder="Tìm sân hoặc khu vực..." />
                        <CommandList>
                            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
                            <CommandGroup heading="Gợi ý">
                                <CommandItem>
                                    <MapPin /> Victory Cầu Giấy
                                    <CommandShortcut>1,2 km</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                    <Star /> Mỹ Đình Arena
                                </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading="Tài khoản">
                                <CommandItem>
                                    <User /> Hồ sơ
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PreviewFrame>
            );
        case "context-menu":
            return (
                <ContextMenu>
                    <ContextMenuTrigger className="mx-auto grid h-40 max-w-md place-items-center rounded-md border border-dashed text-sm text-muted-foreground">
                        Nhấp chuột phải tại đây
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuLabel>Thao tác</ContextMenuLabel>
                        <ContextMenuItem>Xem chi tiết</ContextMenuItem>
                        <ContextMenuItem>Lưu sân</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="destructive">
                            Xóa
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            );
        case "dialog":
            return (
                <div className="text-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Mở dialog</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Xác nhận đặt sân</DialogTitle>
                                <DialogDescription>
                                    Kiểm tra thông tin booking trước khi tiếp
                                    tục.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline">Quay lại</Button>
                                <Button>Xác nhận</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        case "direction":
            return (
                <DirectionProvider dir="rtl">
                    <div
                        className="flex items-center justify-center gap-2 rounded-md border p-4"
                        dir="rtl"
                    >
                        <Button variant="outline">التالي</Button>
                        <span className="text-sm">اتجاه من اليمين</span>
                    </div>
                </DirectionProvider>
            );
        case "drawer":
            return (
                <div className="text-center">
                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button variant="outline">Mở drawer</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>Bộ lọc sân</DrawerTitle>
                                <DrawerDescription>
                                    Chọn môn thể thao và khu vực.
                                </DrawerDescription>
                            </DrawerHeader>
                            <DrawerFooter>
                                <Button>Áp dụng</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Đóng</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>
            );
        case "dropdown-menu":
            return (
                <div className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuItem>
                            Profile
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Billing
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>Team</DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem>Email</DropdownMenuItem>
                                <DropdownMenuItem>Message</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>More...</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuItem>
                            New Team
                            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>GitHub</DropdownMenuItem>
                          <DropdownMenuItem>Support</DropdownMenuItem>
                          <DropdownMenuItem disabled>API</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            Log out
                            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        case "empty":
            return (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Inbox />
                        </EmptyMedia>
                        <EmptyTitle>Chưa có booking</EmptyTitle>
                        <EmptyDescription>
                            Các lịch đặt sân sẽ xuất hiện tại đây.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button>Khám phá sân</Button>
                    </EmptyContent>
                </Empty>
            );
        case "field":
            return (
                <PreviewFrame>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="field-name">
                                Họ và tên
                            </FieldLabel>
                            <Input
                                id="field-name"
                                placeholder="Nguyễn Văn An"
                                className="font-medium"
                            />
                            <FieldDescription>
                                Tên người nhận sân.
                            </FieldDescription>
                        </Field>
                        <Field data-invalid="true">
                            <FieldLabel htmlFor="field-phone">
                                Số điện thoại
                            </FieldLabel>
                            <Input
                                id="field-phone"
                                aria-invalid="true"
                                defaultValue="012"
                            />
                            <FieldError>
                                Vui lòng nhập số điện thoại hợp lệ.
                            </FieldError>
                        </Field>
                    </FieldGroup>
                </PreviewFrame>
            );
        case "form":
            return (
                <PreviewFrame>
                    <FormPreview />
                </PreviewFrame>
            );
        case "hover-card":
            return (
                <div className="text-center">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button variant="link">@sportzone</Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <div className="flex gap-3">
                                <Avatar>
                                    <AvatarFallback>SZ</AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="font-medium">SportZone</p>
                                    <p className="text-sm text-muted-foreground">
                                        Nền tảng đặt sân thể thao.
                                    </p>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            );
        case "input":
            return (
                <PreviewFrame>
                    <Input placeholder="Tìm sân, khu vực hoặc môn thể thao..." />
                </PreviewFrame>
            );
        case "input-group":
            return (
                <PreviewFrame>
                    <InputGroup>
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Tìm kiếm..." />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton>
                                <Kbd>⌘K</Kbd>
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </PreviewFrame>
            );
        case "input-otp":
            return (
                <div className="flex justify-center">
                    <InputOTP maxLength={6}>
                            {[0, 1, 2].map((index) => (
                                <InputOTPSlot key={index} index={index} />
                            ))}
                    <InputOTPSeparator />
                            {[3, 4, 5].map((index) => (
                                <InputOTPSlot key={index} index={index} />
                            ))}
                    </InputOTP>
                </div>
            );
        case "item":
            return (
                <PreviewFrame>
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <CalendarDays />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Booking #SZ-2048</ItemTitle>
                            <ItemDescription>
                                28/06/2026 · 09:00–10:00
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button size="sm" variant="outline">
                                Xem
                            </Button>
                        </ItemActions>
                    </Item>
                </PreviewFrame>
            );
        case "kbd":
            return (
                <div className="flex justify-center">
                    <KbdGroup>
                        <Kbd>⌘</Kbd>
                        <span>+</span>
                        <Kbd>K</Kbd>
                    </KbdGroup>
                </div>
            );
        case "label":
            return (
                <PreviewFrame>
                    <div className="grid gap-2">
                        <Label htmlFor="label-preview">Tên sân</Label>
                        <Input id="label-preview" placeholder="Nhập tên sân" />
                    </div>
                </PreviewFrame>
            );
        case "menubar":
            return (
                <div className="flex justify-center">
                    <Menubar>
                      <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                          <MenubarGroup>
                            <MenubarItem>
                              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem>
                              New Window <MenubarShortcut>⌘N</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem disabled>New Incognito Window</MenubarItem>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarSub>
                              <MenubarSubTrigger>Share</MenubarSubTrigger>
                              <MenubarSubContent>
                                <MenubarGroup>
                                  <MenubarItem>Email link</MenubarItem>
                                  <MenubarItem>Messages</MenubarItem>
                                  <MenubarItem>Notes</MenubarItem>
                                </MenubarGroup>
                              </MenubarSubContent>
                            </MenubarSub>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarItem>
                              Print... <MenubarShortcut>⌘P</MenubarShortcut>
                            </MenubarItem>
                          </MenubarGroup>
                        </MenubarContent>
                      </MenubarMenu>
                      <MenubarMenu>
                        <MenubarTrigger>Edit</MenubarTrigger>
                        <MenubarContent>
                          <MenubarGroup>
                            <MenubarItem>
                              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem>
                              Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                            </MenubarItem>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarSub>
                              <MenubarSubTrigger>Find</MenubarSubTrigger>
                              <MenubarSubContent>
                                <MenubarGroup>
                                  <MenubarItem>Search the web</MenubarItem>
                                </MenubarGroup>
                                <MenubarSeparator />
                                <MenubarGroup>
                                  <MenubarItem>Find...</MenubarItem>
                                  <MenubarItem>Find Next</MenubarItem>
                                  <MenubarItem>Find Previous</MenubarItem>
                                </MenubarGroup>
                              </MenubarSubContent>
                            </MenubarSub>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarItem>Cut</MenubarItem>
                            <MenubarItem>Copy</MenubarItem>
                            <MenubarItem>Paste</MenubarItem>
                          </MenubarGroup>
                        </MenubarContent>
                      </MenubarMenu>
                      <MenubarMenu>
                        <MenubarTrigger>View</MenubarTrigger>
                        <MenubarContent className="w-44">
                          <MenubarGroup>
                            <MenubarCheckboxItem>Bookmarks Bar</MenubarCheckboxItem>
                            <MenubarCheckboxItem checked>Full URLs</MenubarCheckboxItem>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarItem inset>
                              Reload <MenubarShortcut>⌘R</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem disabled inset>
                              Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                            </MenubarItem>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarItem inset>Toggle Fullscreen</MenubarItem>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarItem inset>Hide Sidebar</MenubarItem>
                          </MenubarGroup>
                        </MenubarContent>
                      </MenubarMenu>
                      <MenubarMenu>
                        <MenubarTrigger>Profiles</MenubarTrigger>
                        <MenubarContent>
                          <MenubarRadioGroup value="benoit">
                            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
                          </MenubarRadioGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarItem inset>Edit...</MenubarItem>
                          </MenubarGroup>
                          <MenubarSeparator />
                          <MenubarGroup>
                            <MenubarItem inset>Add Profile...</MenubarItem>
                          </MenubarGroup>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                </div>
            );
        case "native-select":
            return (
                <PreviewFrame>
                    <NativeSelect defaultValue="badminton">
                        <NativeSelectOption value="badminton">
                            Cầu lông
                        </NativeSelectOption>
                        <NativeSelectOption value="football">
                            Bóng đá
                        </NativeSelectOption>
                        <NativeSelectOption value="tennis">
                            Tennis
                        </NativeSelectOption>
                    </NativeSelect>
                </PreviewFrame>
            );
        case "navigation-menu":
            return (
                <div className="flex justify-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="#top">
                                    Trang chủ
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    Khám phá
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid w-64 gap-1 p-2">
                                        <NavigationMenuLink
                                            href="#top"
                                            className="rounded-md p-3 hover:bg-accent"
                                        >
                                            Sân thể thao
                                        </NavigationMenuLink>
                                        <NavigationMenuLink
                                            href="#top"
                                            className="rounded-md p-3 hover:bg-accent"
                                        >
                                            Địa điểm
                                        </NavigationMenuLink>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            );
        case "pagination":
            return (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#navigation-pagination" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink
                                href="#navigation-pagination"
                                isActive
                            >
                                1
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#navigation-pagination">
                                2
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#navigation-pagination" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            );
        case "popover":
            return (
                <div className="text-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <CalendarDays /> Chọn ngày
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverHeader>
                                <PopoverTitle>Ngày thi đấu</PopoverTitle>
                                <PopoverDescription>
                                    Chọn ngày bạn muốn đặt sân.
                                </PopoverDescription>
                            </PopoverHeader>
                        </PopoverContent>
                    </Popover>
                </div>
            );
        case "progress":
            return (
                <PreviewFrame>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Hoàn tất hồ sơ</span>
                            <span>68%</span>
                        </div>
                        <Progress value={68} />
                    </div>
                </PreviewFrame>
            );
        case "radio-group":
            return (
                <RadioGroup defaultValue="venue" className="mx-auto w-fit">
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="venue" id="radio-venue" />
                        <Label htmlFor="radio-venue">Thanh toán tại sân</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="online" id="radio-online" />
                        <Label htmlFor="radio-online">
                            Thanh toán trực tuyến
                        </Label>
                    </div>
                </RadioGroup>
            );
        case "resizable":
            return (
                <div className="h-48 overflow-hidden rounded-lg border">
                    <ResizablePanelGroup orientation="horizontal">
                        <ResizablePanel defaultSize={40}>
                            <div className="grid h-full place-items-center text-sm">
                                Bộ lọc
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={60}>
                            <div className="grid h-full place-items-center bg-muted/30 text-sm">
                                Danh sách sân
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            );
        case "scroll-area":
            return (
                <PreviewFrame>
                    <ScrollArea className="h-48 rounded-md border p-4">
                        <div className="space-y-3">
                            {Array.from({ length: 12 }, (_, index) => (
                                <div
                                    key={index}
                                    className="border-b pb-3 text-sm"
                                >
                                    Khung giờ{" "}
                                    {String(index + 7).padStart(2, "0")}:00
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </PreviewFrame>
            );
        case "select":
            return (
                <PreviewFrame>
                    <Select>
                      <SelectTrigger className="w-full max-w-64">
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>North America</SelectLabel>
                          <SelectItem value="est">Eastern Standard Time</SelectItem>
                          <SelectItem value="cst">Central Standard Time</SelectItem>
                          <SelectItem value="mst">Mountain Standard Time</SelectItem>
                          <SelectItem value="pst">Pacific Standard Time</SelectItem>
                          <SelectItem value="akst">Alaska Standard Time</SelectItem>
                          <SelectItem value="hst">Hawaii Standard Time</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Europe & Africa</SelectLabel>
                          <SelectItem value="gmt">Greenwich Mean Time</SelectItem>
                          <SelectItem value="cet">Central European Time</SelectItem>
                          <SelectItem value="eet">Eastern European Time</SelectItem>
                          <SelectItem value="west">Western European Summer Time</SelectItem>
                          <SelectItem value="cat">Central Africa Time</SelectItem>
                          <SelectItem value="eat">East Africa Time</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Asia</SelectLabel>
                          <SelectItem value="msk">Moscow Time</SelectItem>
                          <SelectItem value="ist">India Standard Time</SelectItem>
                          <SelectItem value="cst_china">China Standard Time</SelectItem>
                          <SelectItem value="jst">Japan Standard Time</SelectItem>
                          <SelectItem value="kst">Korea Standard Time</SelectItem>
                          <SelectItem value="ist_indonesia">
                            Indonesia Central Standard Time
                          </SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Australia & Pacific</SelectLabel>
                          <SelectItem value="awst">Australian Western Standard Time</SelectItem>
                          <SelectItem value="acst">Australian Central Standard Time</SelectItem>
                          <SelectItem value="aest">Australian Eastern Standard Time</SelectItem>
                          <SelectItem value="nzst">New Zealand Standard Time</SelectItem>
                          <SelectItem value="fjt">Fiji Time</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>South America</SelectLabel>
                          <SelectItem value="art">Argentina Time</SelectItem>
                          <SelectItem value="bot">Bolivia Time</SelectItem>
                          <SelectItem value="brt">Brasilia Time</SelectItem>
                          <SelectItem value="clt">Chile Standard Time</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                </PreviewFrame>
            );
        case "separator":
            return (
                <PreviewFrame>
                    <div>
                        <div className="space-y-1">
                            <h4 className="font-medium">SportZone</h4>
                            <p className="text-sm text-muted-foreground">
                                Đặt sân nhanh chóng.
                            </p>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex h-5 items-center gap-4 text-sm">
                            <span>Trang chủ</span>
                            <Separator orientation="vertical" />
                            <span>Booking</span>
                            <Separator orientation="vertical" />
                            <span>Hỗ trợ</span>
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "sheet":
            return (
                <div className="text-center">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">Mở sheet</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Bộ lọc</SheetTitle>
                                <SheetDescription>
                                    Lọc sân theo khu vực và mức giá.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="p-4">
                                <Button className="w-full">Áp dụng</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            );
        case "sidebar":
            return <SidebarPreview />;
        case "skeleton":
            return (
                <PreviewFrame>
                    <div className="flex gap-4">
                        <Skeleton className="size-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                </PreviewFrame>
            );
        case "slider":
            return (
                <PreviewFrame>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <Label>Khoảng giá</Label>
                            <span className="text-muted-foreground">
                                80k – 300k
                            </span>
                        </div>
                        <Slider defaultValue={[25, 75]} max={100} step={5} />
                    </div>
                </PreviewFrame>
            );
        case "sonner":
            return (
                <div className="text-center">
                    <Toaster richColors />
                    <Button onClick={() => toast.success("Đã lưu thay đổi")}>
                        Hiển thị toast
                    </Button>
                </div>
            );
        case "spinner":
            return (
                <div className="flex items-center justify-center gap-4">
                    <Spinner />
                    <Button disabled>
                        <Spinner /> Đang tải
                    </Button>
                </div>
            );
        case "switch":
            return (
                <div className="flex items-center justify-center gap-3">
                    <Switch id="switch-preview" defaultChecked />
                    <Label htmlFor="switch-preview">Nhận thông báo</Label>
                </div>
            );
        case "table":
            return (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã</TableHead>
                                <TableHead>Sân</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">
                                    Tổng
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>#2048</TableCell>
                                <TableCell>Victory</TableCell>
                                <TableCell>
                                    <Badge variant="outline">Đã xác nhận</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    120.000₫
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>#2047</TableCell>
                                <TableCell>Arena</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Chờ xử lý</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    450.000₫
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            );
        case "tabs":
            return (
                <PreviewFrame>
                    <Tabs defaultValue="available">
                        <TabsList className="w-full">
                            <TabsTrigger value="available">
                                Lịch trống
                            </TabsTrigger>
                            <TabsTrigger value="details">Thông tin</TabsTrigger>
                            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="available"
                            className="rounded-md border p-4 text-sm"
                        >
                            8 khung giờ còn trống hôm nay.
                        </TabsContent>
                        <TabsContent
                            value="details"
                            className="rounded-md border p-4 text-sm"
                        >
                            Sân trong nhà, có điều hòa.
                        </TabsContent>
                        <TabsContent
                            value="reviews"
                            className="rounded-md border p-4 text-sm"
                        >
                            4,8 / 5 điểm.
                        </TabsContent>
                    </Tabs>
                </PreviewFrame>
            );
        case "textarea":
            return (
                <PreviewFrame>
                    <Textarea placeholder="Nhập ghi chú cho chủ sân..." />
                </PreviewFrame>
            );
        case "toggle":
            return (
                <div className="flex justify-center gap-2">
                    <Toggle aria-label="In đậm">
                        <Bold />
                    </Toggle>
                    <Toggle aria-label="In nghiêng" variant="outline">
                        <Italic />
                    </Toggle>
                    <Toggle aria-label="In nghiêng" variant="outline" size={"lg"}>
                        <Italic />
                    </Toggle>
                    <Toggle aria-label="In nghiêng" variant="outline" size={"sm"}>
                        <Italic />
                    </Toggle>
                </div>
            );
        case "toggle-group":
            return (
                <div className="flex justify-center">
                    <ToggleGroup type="multiple" variant="outline">
                        <ToggleGroupItem value="bold" aria-label="In đậm">
                            <Bold />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="italic" aria-label="In nghiêng">
                            <Italic />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="underline"
                            aria-label="Gạch chân"
                        >
                            <Underline />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            );
        case "tooltip":
            return (
                <div className="text-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Trợ giúp"
                            >
                                <CircleHelp />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Hướng dẫn đặt sân</TooltipContent>
                    </Tooltip>
                </div>
            );
        default:
            return (
                <p className="text-center text-sm text-muted-foreground">
                    Chưa có preview cho {name}.
                </p>
            );
    }
}
