---
title: "Writing a C Compiler: Part 2, Parser and Code Generation"
date: "2021-11-26T21:19Z"
---

I've worked a bit more on the compiler, implementing the parsing and code generation steps. So, the program to compile is as follows:

```c
int main() {
    return 42;
}
```

---

**Disclaimer**: If you are interested in doing this yourself, I would recommend reading [Nora Sandler's blog posts](https://norasandler.com/2017/11/29/Write-a-Compiler.html). I'm providing the source code that I ended up with, whereas the instructions found in the blog posts provides good context and instructions without providing any actual code or being prescriptive about the implementation.

---

You can see the code I wrote for the lexer [here](/2021/11-20-compiler-lexer). I've learned that the lexer actually performs a relatively simple task (compared to the other steps) in that it simply creates a list of tokens. It doesn't provide any structure or try to find syntax errors.

The next step is to build the Abstract Syntax Tree (AST) based on the list of tokens. This is where the program gets it's hiarchical structure. In order to create an AST, each node can be described a combination of tokens or specific kinds of other nodes. For example, a "function" node would be a combination of keywords for return type, tokens for opening and closing brackets, expressions for arguments, statements for the function body, etc. Things like expressions and statements are also nodes, which have their own parsing rules, including tokens and further nodes. As the tokens are parsed, a tree is created as nodes become nested.

Again, each node is handled differently. For the 3-line example program, there are four types of nodes:
 * Program (the toplevel node)
 * Function (a single `main` function)
 * Statement (a single `return` statement)
 * Expression (a single constant value integer)

As far as code goes, here's what I got. Still goin' strong with the ruby.

```ruby
# frozen_string_literal: true

class ParseError < StandardError; end

class Node
  attr_reader :tokens

  def initialize(tokens)
    @tokens = tokens
  end
end

class Program < Node
  attr_reader :function

  def parse!
    @function = Function.new(tokens).parse!

    raise ParseError, format('root function must be called main, found %s', @function.id) if @function.id != 'main'

    self
  end
end

class Statement < Node
  attr_reader :is_return, :expression

  def parse!
    token = tokens.shift

    if token.type == Token::KEYWORD && token.value == 'return'
      @is_return = true
    else
      tokens.unshift(token)
    end

    @expression = Expression.new(tokens).parse!

    self
  end
end

class Expression < Node
  attr_reader :constant_value

  def parse!
    token = tokens.shift
    raise ParseError, format('unexepected, got %<type>s : %<value>s', **token) unless token.type == Token::CONST

    @constant_value = token.value

    token = tokens.shift
    raise ParseError, format('expected terminator, got %<type>s : %<value>s', **token) unless token.type == Token::TERM

    self
  end
end

class Function < Node
  attr_reader :return_type, :id, :statements

  def parse!
    @statements = []

    token = tokens.shift

    unless token.type == Token::KEYWORD && return_types.include?(token.value)
      raise ParseError, format('invalid function return type %<type>s : %<value>s', **token)
    end

    @return_type = token.value

    token = tokens.shift
    raise ParseError, format('expected function name, got %<type>s : %<value>s', **token) unless token.type == Token::ID

    @id = token.value

    token = tokens.shift
    raise ParseError, format('expected args, got %<type>s : %<value>s', **token) unless token.type == Token::PAREN

    token = tokens.shift
    raise ParseError, format('expected args, got %<type>s : %<value>s', **token) unless token.type == Token::END_PAREN

    token = tokens.shift
    raise ParseError, format('expected args, got %<type>s : %<value>s', **token) unless token.type == Token::BLOCK

    loop do
      if token.type == Token::END_BLOCK
        raise ParseError, format('missing return') if @statements.empty?

        break
      end

      raise ParseError, 'unexpected end of function' if tokens.empty?

      @statements << Statement.new(tokens).parse!

      raise ParseError, 'unexpected end of function' if tokens.empty?

      token = tokens.shift
    end

    self
  end

  def return_types
    ['int']
  end
end

class Parse
  attr_reader :compiler
  attr_accessor :curnode

  def initialize(compiler)
    @compiler = compiler
    @ast = Program.new(compiler.tokens)
    @curnode = @ast
  end

  def parse!
    @curnode.parse!
  end
end
```

I'm going to throw in the code generator here too, since (for now) it's actually relatively simple. I'm reopening classes here, sorry. It's work a work in progress.

```ruby
# frozen_string_literal: true

class Function
  def compile!
    <<~ASM
      .globl #{id}
      #{id}:
      #{statements.map(&:compile!).join("\n")}
    ASM
  end
end

class Statement
  def compile!
    <<~ASM
      #{expression.compile!}
      #{is_return ? 'ret' : ''}
    ASM
  end
end

class Expression
  def compile!
    <<~ASM
      movl    $#{constant_value}, %eax
    ASM
  end
end

class Generate
  attr_reader :compiler

  def initialize(compiler)
    @compiler = compiler
    @buf = ''
  end

  def compile!
    main = compiler.ast.function
    main.compile!
  end
end
```

I'm a bit concerned how this will scale. It seems like the parsing of each node is _very_ specific to that node. I guess it would be, I'm not sure what I'm trying to say here. I just assume what I'm doing here will break down quickly and stop working. We'll see!

I'm glad I made it this far, I'm curious to see how much more I can build on what I have here. Looking forward to [Part 2](https://norasandler.com/2017/12/05/Write-a-Compiler-2.html).
