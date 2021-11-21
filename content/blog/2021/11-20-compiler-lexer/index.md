---
title: "Writing a C Compiler: Part 1, Lexer"
date: "2021-11-10T20:33Z"
---

As a programmer I enjoy building things. I also like knowing how things work, I figure the two are related. There are a few things that I feel I've missed out on from not attending a CS program (nothing practical of course), one being a deeper understanding of how programming languages are written. To this end I've decided to spend some time learning how to write compilers. 

I decided that writing a C compiler would be a good place to start. I don't know C. In spite of this, I think it will be a good choice because of it's simplicity. Not simplicity in terms of writing correct programs with it, but simplicity in terms of being "lower level" so probably less work to turn it into assembly. 

I did a Google search for something like "write C compiler tutorial" and [found this post series](https://norasandler.com/2017/11/29/Write-a-Compiler.html) which looks promising. I'll probably try to do posts that match, 10 parts. 

Nora said examples will be given in x86 instruction sets, but I'll be attempting to rewrite using AMD64. Based on AMD64 docs this should be fine because it should support all x86 instructions. 

Also, Nora started writing in python and eventually switched to OCamel, despite not knowing the language at all. I'm going to start in Ruby and see how it goes!

The first step is to write a lexer. It seems all a lexer does is turn a code file into a list of tokens. Parenthes, keywords, identifiers, etc. It does not add any structure or attempt to check the code as valid. Later steps use the list of tokens to create the structure of the program. 

The program to be, uh, lexed is this:

```c
int main() {
    return 500;
}
```

Here's the lexer I wrote:

```ruby
module Token
    BLOCK = :BLOCK
    END_BLOCK = :END_BLOCK
    PAREN = :PAREN
    END_PAREN = :END_PAREN
    KEYWORD = :KEYWORD
    CONST = :CONST
    TERM = :TERM
    ID = :ID

    def self.keywords
        [
            "int",
            "return"
        ]
    end
end

tokens = []
curconst = ""

File.open(ARGV.last).each_char do |char|
    if /[a-zA-Z0-9]/ =~ char
        curconst << char
        next
    end

    if curconst.length > 0
        if Token.keywords.include? curconst
            tokens << [Token::KEYWORD, curconst]
        elsif curconst =~ /^[0-9]+$/
            tokens << [Token::CONST, curconst]
        else
            tokens << [Token::ID, curconst]
        end

        curconst = ""
    end

    token = case char
    when '{' then [Token::BLOCK, char]
    when '}' then [Token::END_BLOCK, char]
    when '(' then [Token::PAREN, char]
    when ')' then [Token::END_PAREN, char]
    when ';' then [Token::TERM, char]
    when /\s/ then next
    else
        raise "unknown token %s" % char.inspect
    end

    tokens << token
end
```

neat-o, it lexes! cool. The next step is to create the AST. I'll be covering that in my next post, unless I completely lose interest and never work on this again!
