---
title: "Writing a C Compiler: Part 1"
date: "2021-11-03T18:17Z"
published: false
---

As a programmer I enjoy building things. I also like knowing how things work, I figure the two are related. There are a few things that I feel I've missed out on from not attending a CS program (nothing practical of course), one being a deeper understanding of how programming languages are written. To this end I've decided to spend some time learning how to write compilers. 

I decided that writing a C compiler would be a good place to start. I don't know C. In spite of this, I think it will be a good choice because of it's simplicity. Not simplicity in terms of writing correct programs with it, but simplicity in terms of being "lower level" so probably less work to turn it into assembly. 

I did a Google search for something like "write C compiler tutorial" and [found this post series](https://norasandler.com/2017/11/29/Write-a-Compiler.html) which looks promising. I'll probably try to do posts that match, 10 parts. 

Nora said examples will be given in x86 instruction sets, but I'll be attempting to rewrite using AMD64. Based on AMD64 docs this should be fine because it should support all x86 instructions. 

Also, Nora started writing in python and eventually switched to OCamel, despite not knowing the language at all. I'm going to start in Ruby and see how it goes!



