# Genel Terimler

1- Thread
2- Heap
3- Stack
4- RabbitMq
5- Kafka
6- Elasticsearch
7- JWT token
8- Solid
9- OOP
10- Dependency Injection
11- Middleware
12- RESTful API
13- CLR - Common Language Runtime - .Net kodlarını maline diline çevirir.
14- Microservices
15- MVC
16- trace
17- KISS / YAGNI
18- B-Tree
19- Clustered Index
20- Non-Clustered Index
21- senkron
22- asenkron


# Solid
- Single Responsibility Principle - Bir class birden fazla iş mantığında fonksiyon barındırmamalı.
- Open / Closed Prinsiple - if else ler artıyorsa sorun var demektir ödeme sistemi gibi kredi kartı ödeme yaptık bir de cripto için ya da havale ile ödeme gelince if elselerin artması anlamına geliyor. Ya ödeme yöntemlerini tek bir abstract içinde otplarız ya da ayrı ayrı Interfaceler tanımlarız değil mi yoksa tüm ödeme yöntemleri de tek interface de tanımlanır mı interface ile abtract classın farkı interface de method tanımlanmaması mıydı sadece
- Liskov Substitution Principle -  Tanımladığımız sınıfı kullanan alt sınıflar, üst sınıfların tüm özelliklerini kullanabilmeli. ya da kullanmıyorsa kullanmadığı seçenekler opsiyonel olmalı
- Interface Segregation Principle - Bir sınıf, kullanmadığı Interfacelere bağlı olmamalıdır. Yani bir interface çok fazla method barındırıyorsa o interface i parçalara bölmek lazım.
- Dependency Inversion Principle - Yüksek seviyeli modüller, düşük seviyeli modüllere bağlı olmamalıdır. Her ikisi de soyutlamalara bağlı olmalıdır. Soyutlamalar detaylara bağlı olmamalıdır. Detaylar soyutlamalara bağlı olmalıdır.

# C# History

2002 yılında C# 1.0;

- .NET Framework 1.0 (tek runtime)
  - Web
  - Desktop
  - Backend (mantıksal)

- ASP.NET Web Forms (IIS üzerinde)

- WinForms (Windows Forms Application) / desktop

- Console Application (CLI) / backend

- ASP.NET Web Service (ASMX)
  - SOAP
  - XML
  - HTTP
  - WSDL

2004-2005 yılında C# 2.0;
 1- Büyük kurumsal projeler:
    - WinForms + Web Forms
    - ASMX + XML
 2- .NET Framework 2.0
    - Generics
    - Partial Classes
    - Anonymous Methods
    - Nullable Types
    - Iterators
    - Covariance and Contravariance
    - Static Classes
    - Improved COM Interoperability
  3- C#
    - Sp yazma
    - Try-catch-finally

şimdi adım adım gelişmeleri söyle bana .net ve c# ile ilgili sql ile ilgili de olabilir 2003 de bir şey çıktı mı 

# Mimari History
2002;
Layered Architecture