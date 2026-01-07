import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const CertsBreadcrumb = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/main">Главная</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>{">"}</BreadcrumbSeparator>{" "}
        <BreadcrumbItem>
          <BreadcrumbPage>Подарочные сертификаты</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
